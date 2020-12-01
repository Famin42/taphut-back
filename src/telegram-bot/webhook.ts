import { APIGatewayProxyHandler, APIGatewayEvent, Context, Callback } from 'aws-lambda';
import * as rp from 'request-promise';
import 'source-map-support/register';

const TG_BOT_TOKEN: string | undefined = process.env.TG_BOT_TOKEN;
async function sendToUser(chat_id: string, text: string): Promise<unknown> {
  const options = {
    method: 'GET',
    uri: `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`,
    qs: {
      chat_id,
      text,
    },
  };
  return rp(options);
}

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback,
): Promise<any> => {
  if (!TG_BOT_TOKEN) {
    throw new Error('There is no TG_BOT_TOKEN!');
  }

  if (!event.body) {
    throw new Error();
  }

  const body = JSON.parse(event.body);
  const { chat, text } = body.message;

  console.log('\n\n\n------------------------------------------------\n\n\n');
  console.log('******************** APIGatewayEvent ********************');
  console.log(JSON.stringify(event, null, 2));
  console.log('\n\n\n------------------------------------------------\n\n\n');
  console.log('******************** Context ********************');
  console.log(JSON.stringify(context, null, 2));
  console.log('\n\n\n------------------------------------------------\n\n\n');
  console.log('******************** Callback ********************');
  console.log(JSON.stringify(callback, null, 2));
  console.log('\n\n\n------------------------------------------------\n\n\n');

  if (text) {
    await sendToUser(chat.id, `Your text:\n${text}`);
  } else {
    await sendToUser(chat.id, 'Text message is expected.');
  }

  return {
    statusCode: 200,
  };
};
