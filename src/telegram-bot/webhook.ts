import { APIGatewayProxyHandler, APIGatewayEvent, Context, Callback } from 'aws-lambda';

import { httpError, httpSuccess, IHttpResponse, toLambdaHttpResponse } from 'utils/api-gateway';
import logger, { setDebugLevel } from 'utils/logger';
import { mustEnv } from 'utils/env';
import { buildParser } from './cli';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

const TG_BOT_TOKEN = 'TG_BOT_TOKEN';

async function processMessage({ body }: APIGatewayEvent): Promise<IHttpResponse> {
  const token: string = mustEnv(TG_BOT_TOKEN);

  if (!body) {
    logger.error(`APIGatewayEvent body is undefined: ${JSON.stringify(body)}`);
    return httpError(400, 'chat_id is required');
  }

  const { message } = JSON.parse(body);
  const chat_id = message?.chat?.id;
  const { text: stringCommand } = message;

  if (!chat_id) {
    logger.error(`chat_id is required: ${JSON.stringify(chat_id)}`);
    return httpError(400, 'chat_id is required');
  }

  logger.info(`Build Parser`);
  const parser = buildParser({ chatId: chat_id, token });
  parser(stringCommand);

  return httpSuccess();
}

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
): Promise<any> => {
  logger.info(`APIGatewayEvent event: ${JSON.stringify(event)}`);
  logger.info(`APIGatewayEvent context: ${JSON.stringify(context)}`);

  const res: IHttpResponse = await processMessage(event);

  logger.info(`processMessage result: ${JSON.stringify(res)}`);

  callback(null, toLambdaHttpResponse(res));
};
