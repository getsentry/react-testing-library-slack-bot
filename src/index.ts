import {App} from '@slack/bolt';
import {config} from 'dotenv';
import {getProgress} from './progress';

config();

const app = new App({
  token: process.env.BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.event('app_mention', async ({event, say}) => {
  if (event.text.includes('rtl')) {
    const {channel, ts} = await say({
      text: ':sentry-loading: fetching status ...',
      blocks: [
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: ':sentry-loading: fetching status ...',
            },
          ],
        },
      ],
    });
    const {remainingFiles, progress} = await getProgress();

    if (!channel || !ts) {
      return;
    }

    await app.client.chat.update({
      channel,
      ts,
      text: `RTL progress: ${progress}% completed, ${remainingFiles} files remaining`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:rtl: progress: *${progress}%* completed, *${remainingFiles}* files remaining`,
          },
        },
      ],
    });
  }
});

(async () => {
  const port = 3000;
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
