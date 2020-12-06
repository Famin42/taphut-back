import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { getFilterById } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = 'filter-get';
const DESCRIPTION = 'Get filter by name';

function buildGetFilterById<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    const filterId = 'filterId';
    let result: any = await getFilterById(chatId, filterId);
    result = 'getFilterById executed success';
    argv.respond(result);
  };
}

export function adddGetFilterByIdCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, {}, buildGetFilterById(chatId));
}
