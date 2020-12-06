import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { filterToString } from 'utils/converters/filter';
import { getFilterById, IFIlter } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = 'filter-get';
const DESCRIPTION = 'Get filter by name';

function buildGetFilterById<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    const filterName = 'MOCK_FILTER_6';
    const filter: IFIlter | undefined = await getFilterById(chatId, filterName);

    if (filter) {
      argv.respond(filterToString(filter));
    } else {
      argv.respond(`"${filterName}" filter doesn't exist!`);
    }
  };
}

export function adddGetFilterByIdCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, {}, buildGetFilterById(chatId));
}
