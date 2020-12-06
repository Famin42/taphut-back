import { Arguments, Argv, InferredOptionTypes, Options, usage } from 'yargs';

import { sendToUser } from '../utils/telegram';
import { adddCreateFilterCommand } from './commands/filter-create';
import { adddDeleteFilterByIdCommand } from './commands/filter-delete';
import { adddGetFilterByIdCommand } from './commands/filter-get';
import { adddUpdateFilterByIdCommand } from './commands/filter-update';
import { adddGetFiltersCommand } from './commands/filter-list';

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
  const argv = usage('[command]');
  const parser = addCommands({
    argv,
    chatId,
  })
    .demand(1)
    .strict()
    .help()
    .epilog('telegram-bot Taphut');

  const context: Context = {
    respond: buildResponder(token, chatId),
  };

  return (stringCommand: string) => {
    parser.parse(stringCommand || '', context, (err: any, argv: any, output: any) => {
      if (err) console.log(err.message);
      if (output) {
        argv.respond(output);
      }
    });
  };
}
