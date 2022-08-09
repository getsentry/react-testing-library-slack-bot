import fs from 'fs';
import {Clone} from 'nodegit';
import path from 'path';

// temporary sentry cloned respository path
const dirPath = path.join(__dirname, '../temp');
const testsPath = path.join(__dirname, '../temp/tests/js/spec');

const getTestFiles = function (dirPath: string, arrayOfFiles: string[] | undefined = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getTestFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      if (/\.spec.*?$/.test(file)) {
        arrayOfFiles.push(path.join(dirPath, '/', file));
      }
    }
  });

  return arrayOfFiles;
};

export async function getProgress(data?: string) {
  //delete cloned sentry repository
  fs.rmdirSync(dirPath, {recursive: true});

  // clone sentry repository
  await Clone.clone('https://github.com/getsentry/sentry', dirPath);

  const testFiles = getTestFiles(testsPath);
  const testFilesWithEnzymeImport = testFiles.filter(file => {
    const base64Content = fs.readFileSync(file);
    const content = Buffer.from(base64Content).toString('utf-8');
    return content.includes('sentry-test/enzyme');
  });

  return {
    remainingFiles: testFilesWithEnzymeImport.length,
    progress:
      Math.round((testFilesWithEnzymeImport.length / testFiles.length) * 10000) / 100,
  };
}
