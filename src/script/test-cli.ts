import { mustEnv } from 'utils/env';
import { buildParser } from 'telegram-bot/cli';
import logger, { setDebugLevel } from 'utils/logger';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

// const stringCommand = '--help';
const stringCommand = 'filter-list';
// const stringCommand = 'filter-get';
// const stringCommand = 'filter-create';
// const stringCommand = 'filter-delete';
// const stringCommand = 'filter-update';
const chatId = mustEnv('CHAT_ID');
const token = mustEnv('TG_BOT_TOKEN');

function main(): void {
  try {
    logger.debug(`stringCommand: ${JSON.stringify(stringCommand, null, 2)}`);

    const parser = buildParser({ chatId, token });
    logger.info(`buildParser: Success`);

    parser(stringCommand);
    logger.debug(`execute parser: Success`);
  } catch (error) {
    logger.error(error.message);
  }
}

main();
