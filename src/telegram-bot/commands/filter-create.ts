import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { createFilter, IFIlter } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = 'filter-create';
const DESCRIPTION = 'Create filter';

function buildCreateFilter<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    const filter: Omit<IFIlter, 'id' | 'chatId'> = {} as any;
    let result: any = await createFilter(chatId, filter);
    result = 'createFilter executed success';
    argv.respond(result);
  };
}

export function adddCreateFilterCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, {}, buildCreateFilter(chatId));
}
