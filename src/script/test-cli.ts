import { mustEnv } from 'utils/env';
import { buildParser } from 'telegram-bot/cli';
import logger, { setDebugLevel } from 'utils/logger';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

const chatId = mustEnv('CHAT_ID');
const token = mustEnv('TG_BOT_TOKEN');

function main(): void {
  try {
    const command = process.argv.slice(2).reduce((command, str) => command.concat(` ${str}`), '');

    const parser = buildParser({ chatId, token });

    parser(command);
    logger.debug(`execute parser: Success`);
  } catch (error) {
    logger.error(error.message);
  }
}

main();
