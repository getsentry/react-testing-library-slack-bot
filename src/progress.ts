import {Octokit} from '@octokit/rest';
import {RequestError} from './error';
import fs from 'fs';
import path from 'path';
import concatStream from 'concat-stream';
import tar from 'tar';
import {PassThrough as PassThroughStream} from 'stream';

const owner = 'getsentry';
const repo = 'sentry';

function bufferToStream(buffer: Buffer): NodeJS.ReadableStream {
  const stream = new PassThroughStream();
  stream.end(buffer);
  return stream;
}

function extractFilesFromTarball(tarball: Buffer) {
  return new Promise<{testFilesWithEnzymeImport: number; totalFiles: number}>(
    (resolve, reject) => {
      let testFilesWithEnzymeImport = 0;
      let totalFiles = 0;

      const parser = new tar.Parse({
        strict: true,
        filter: (currentPath: string) => /\.spec.*?$/.test(currentPath),
        onentry: entry => {
          entry.on('data', chunk => {
            totalFiles += 1;
            const content = Buffer.from(chunk).toString('utf-8');
            if (content.includes('sentry-test/enzyme')) {
              testFilesWithEnzymeImport += 1;
            }
          });

          entry.on('end', () => {
            resolve({testFilesWithEnzymeImport, totalFiles});
          });

          entry.on('error', err => {
            reject(err);
          });
        },
      });
      bufferToStream(tarball)
        .pipe(parser)
        .on('end', () => {
          console.log({testFilesWithEnzymeImport});
          resolve({testFilesWithEnzymeImport, totalFiles});
        });
    }
  );
}

export async function getProgress() {
  const octokit = new Octokit();

  const content = await octokit.repos.getContent({
    owner,
    repo,
    path: 'tests/js',
  });

  if (!Array.isArray(content.data)) {
    throw new RequestError('Invalid directory', 400);
  }

  const spec = content.data.find(({name}) => name === 'spec');

  if (!spec) {
    throw new RequestError('Invalid directory', 400);
  }

  // Download the archive
  const response = await octokit.rest.repos.downloadTarballArchive({
    owner,
    repo,
    ref: spec.sha,
  });

  // @ts-ignore https://github.com/octokit/types.ts/issues/211
  const buffer = Buffer.from(response.data);

  const {testFilesWithEnzymeImport, totalFiles} = await extractFilesFromTarball(buffer);
  console.log({testFilesWithEnzymeImport, totalFiles});

  return {
    remainingFiles: testFilesWithEnzymeImport,
    progress: Math.round((testFilesWithEnzymeImport / totalFiles) * 10000) / 100,
  };
}
