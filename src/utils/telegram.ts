import { url } from 'inspector';
import fetch from 'node-fetch';
import { stringify } from 'querystring';

/**
 * Sends text messafe to chat
 *
 * @param chat_id telegram chat which will receive message
 * @param text text of message
 * @param token token from Telegram-bot which is needed for sensing message
 */
export async function sendToUser({
  token,
  chat_id,
  text,
}: {
  token: string;
  chat_id: string;
  text: string;
}): Promise<unknown> {
  const uri = new URL(`${getTelegramBaseURL(token)}/sendMessage?${stringify({ chat_id, text })}`);

  return fetch(uri);
}

function getTelegramBaseURL(token: string): string {
  return `https://api.telegram.org/bot${token}`;
}
