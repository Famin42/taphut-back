import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { getFilters } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = 'filter-list';
const DESCRIPTION = 'List all filters';

function buildGetFiltersByChatId<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    let result: any = await getFilters(chatId);
    result = 'getFiltersByChatId executed success';
    argv.respond(result);
  };
}

export function adddGetFiltersCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, {}, buildGetFiltersByChatId(chatId));
}
