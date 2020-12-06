import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { filtersToString } from 'utils/converters/filter';
import { getFilters } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = ['filter-list', 'fl'];
const DESCRIPTION = 'List all filters';

function buildGetFiltersByChatId<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    const filters: any = await getFilters(chatId);
    const msg = filtersToString(filters);
    argv.respond(msg);
  };
}

export function adddGetFiltersCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, {}, buildGetFiltersByChatId(chatId));
}
