import { APIGatewayProxyHandler, APIGatewayEvent, Context, Callback } from 'aws-lambda';
import * as rp from 'request-promise';
import 'source-map-support/register';

const TELEGRAM_TOKEN: string | undefined = process.env.TG_BOT_TOKEN;

async function sendToUser(chat_id, text): Promise<any> {
  const options = {
    method: 'GET',
    uri: `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    qs: {
      chat_id,
      text,
    },
  };
  return rp(options);
}

export const hello: APIGatewayProxyHandler = async (
  event: APIGatewayEvent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context: Context,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _callback: Callback,
): Promise<any> => {
  const body = JSON.parse(event.body);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { chat, text } = body.message;

  if (text) {
    await sendToUser(chat.id, `Your text:\n${text}`);
  } else {
    await sendToUser(chat.id, 'Text message is expected.');
  }

  return {
    statusCode: 200,
  };
};
