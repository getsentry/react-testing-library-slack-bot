import {App} from '@slack/bolt';
import {config} from 'dotenv';
import {getProgress} from './progress';

config();

const app = new App({
  token: process.env.BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.command('/knowledge', async ({ack, say}) => {
  try {
    await ack();
    say('Yaaay! that command works!');
  } catch (error) {
    console.log('err');
    console.error(error);
  }
});

app.message(/status/, async ({event, say}) => {
  await getProgress();

  try {
    say('Yaaay! that command works!');
  } catch (error) {
    console.log('err');
    console.error(error);
  }
});

(async () => {
  const port = 3000;
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
