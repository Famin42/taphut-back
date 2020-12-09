import { stringify } from 'querystring';
import fetch, { Response } from 'node-fetch';
import logger, { setDebugLevel } from 'utils/logger';
import { getTelegramBaseURL } from 'utils/telegram';
import { mustEnv } from 'utils/env';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

const newEndpoint = 'newEndpoint';
const token = mustEnv('TG_BOT_TOKEN');

const uri = new URL(`${getTelegramBaseURL(token)}/setWebhook?${stringify({ url: newEndpoint })}`);

logger.info(`formed URI: ${JSON.stringify(uri)}`);

fetch(uri)
  .then(async (result: Response) => {
    const json = await result.json();
    logger.info(`Response status: ${JSON.stringify(result.headers.get('status'))}`);
    logger.info(`Response status: ${JSON.stringify(json)}`);
  })
  .catch((error) => {
    logger.error(error.message);
  });
