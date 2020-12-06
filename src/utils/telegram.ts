import fetch, { Response } from 'node-fetch';
import { stringify } from 'querystring';

import logger, { setDebugLevel } from 'utils/logger';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

/**
 * Sends text messafe to chat
 *
 * @param chat_id telegram chat which will receive message
 * @param text text of message
 * @param token token from Telegram-bot which is needed for sensing message
 * @return Response
 */
export function sendToUser({
  token,
  chat_id,
  text,
}: {
  token: string;
  chat_id: string;
  text: string;
}): Promise<Response> {
  const uri = new URL(`${getTelegramBaseURL(token)}/sendMessage?${stringify({ chat_id, text })}`);

  logger.info(`URI from sendToUser: ${JSON.stringify(uri)}`);

  return fetch(uri);
}

export function getTelegramBaseURL(token: string): string {
  return `https://api.telegram.org/bot${token}`;
}
