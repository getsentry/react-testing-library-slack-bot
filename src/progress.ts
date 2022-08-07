import {Octokit} from '@octokit/rest';

const owner = 'getsentry';
const repo = 'sentry';

export async function getProgress() {
  const octokit = new Octokit();

  const content = await octokit.repos.getContent({
    owner,
    repo,
    path: 'src/sentry/static/sentry',
  });

  console.log({content});

  // const app = contents.data.find(({name}) => name === 'app');

  // const tree = await octokit.git.getTree({
  //   owner,
  //   repo,
  //   tree_sha: app.sha,
  //   recursive: 1,
  // });

  // console.log({treee: tree.data.tree})

  //   const jsxFiles = tree.data.tree.filter(({path}) => /\.jsx?$/.test(path)) || [];
  //   const tsxFiles = tree.data.tree.filter(({path}) => /\.tsx?$/.test(path)) || [];

  //   const total = jsxFiles.length + tsxFiles.length;

  //   return {
  //     remainingFiles: jsxFiles.length,
  //     progress: Math.round((tsxFiles.length / total) * 10000) / 100,
  //   };
}
