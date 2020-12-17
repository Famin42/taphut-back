import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { filtersToString } from 'utils/converters/filter';
import { getFilters, IFIlterRow } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = ['filter-list', 'fl'];
const DESCRIPTION = 'List all filters';

const ERROR_MESSAGE = 'Some error occurred during getting filters.';

function buildGetFiltersByChatId<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    try {
      const { Items } = await getFilters(chatId);
      const filters = Items.map((f: IFIlterRow) => f.filter);
      const msg = filtersToString(filters);
      argv.respond(msg);
    } catch (error) {
      argv.respond(error?.message || ERROR_MESSAGE);
    }
  };
}

export function adddGetFiltersCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, {}, buildGetFiltersByChatId(chatId));
}
