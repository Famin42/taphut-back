import { Arguments, Argv, InferredOptionTypes, Options } from 'yargs';
import yargs = require('yargs/yargs');

import { sendToUser } from '../utils/telegram';
import logger, { setDebugLevel } from 'utils/logger';
import { adddGetFiltersCommand } from './commands/filter-list';
import { adddGetFilterByIdCommand } from './commands/filter-get';
import { adddCreateFilterCommand } from './commands/filter-create';
import { adddDeleteFilterByIdCommand } from './commands/filter-delete';
import { adddUpdateFilterByIdCommand } from './commands/filter-update';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

export type Context = {
  respond: (msg: string) => void;
};

export type CommandBuilderType<T> = {
  chatId: string;
  argv: Argv<T>;
};

export type CustomExtend = { [key: string]: Options };
export type CustomArgv<O extends CustomExtend> = Arguments<InferredOptionTypes<O>> & Context;
export type CustomArgvHandler<O extends CustomExtend> = (argv: CustomArgv<O>) => void;

function buildResponder(token: string, chat_id: string): any {
  return function (msg: any): any {
    sendToUser({ token, chat_id, text: msg });
    console.log(msg);
  };
}

type buildParserParams = {
  token: string;
  chatId: string;
};

function addCommands<T>({ argv, chatId }: CommandBuilderType<T>): Argv<T> {
  argv = adddGetFiltersCommand({ argv, chatId }); //        filter-list
  argv = adddGetFilterByIdCommand({ argv, chatId }); //     filter-get
  argv = adddCreateFilterCommand({ argv, chatId }); //      filter-create
  argv = adddUpdateFilterByIdCommand({ argv, chatId }); //  filter-update
  argv = adddDeleteFilterByIdCommand({ argv, chatId }); //  filter-delete
  return argv;
}

export function buildParser({ token, chatId }: buildParserParams): (stringCommand: string) => void {
  const argv = yargs().usage('[command]');
  const parser = addCommands({
    argv,
    chatId,
  })
    .demand(1)
    .strict()
    .version('v')
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help')
    .epilog('telegram-bot Taphut');

  const context: Context = {
    respond: buildResponder(token, chatId),
  };

  return (stringCommand: string) => {
    logger.info(`Command to parse: ${stringCommand}`);
    parser.parse(stringCommand || '', context, (err: any, argv: any, output: any) => {
      if (err) console.log(err.message);
      if (output) {
        argv.respond(output);
      }
    });
  };
}
