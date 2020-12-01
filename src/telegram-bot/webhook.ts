import { APIGatewayProxyHandler, APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { mustEnv } from 'utils/env';
import { httpSuccess, toLambdaHttpResponse } from 'utils/api-gateway';
import { sendToUser } from 'utils/telegram';

const TG_BOT_TOKEN = 'TG_BOT_TOKEN';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback,
): Promise<any> => {
  const token: string = mustEnv(TG_BOT_TOKEN);

  if (!event.body) {
    throw new Error();
  }

  const body = JSON.parse(event.body);
  const chat_id = body?.chat?.id;
  let { text } = body?.message;

  console.log('\n\n\n------------------------------------------------\n\n\n');
  console.log('******************** APIGatewayEvent ********************');
  console.log(JSON.stringify(event, null, 2));
  console.log('\n\n\n------------------------------------------------\n\n\n');
  console.log('******************** Context ********************');
  console.log(JSON.stringify(context, null, 2));
  console.log('\n\n\n------------------------------------------------\n\n\n');

  if (text) {
    text = `Your text:\n${text}`;
  } else {
    text = 'Text message is expected.';
  }

  const res: unknown = await sendToUser({
    chat_id,
    text,
    token,
  });

  console.log('******************** result from sendToUser ********************');
  console.log(JSON.stringify(res, null, 2));
  console.log('\n\n\n------------------------------------------------\n\n\n');

  callback(null, toLambdaHttpResponse(httpSuccess({})));
};
