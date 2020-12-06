import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { filterToString } from 'utils/converters/filter';
import { IFIlter, updateFilterById } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = 'filter-update';
const DESCRIPTION = 'Update filter';

const ERROR_MESSAGE = 'Some error occurred during deleting the filter.';

function buildUpdateFilterById<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    try {
      const filterName = 'MOCK_FILTER_5';
      const newFilter: Partial<Omit<IFIlter, 'id'>> = {};
      const filter = await updateFilterById(chatId, filterName, newFilter);

      const msg = filterToString(filter, `Filter "${filterName}" is updated successfully.\n`);

      argv.respond(msg);
    } catch (error) {
      const errMsg = error?.message || ERROR_MESSAGE;
      argv.respond(errMsg);
    }
  };
}

export function adddUpdateFilterByIdCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, {}, buildUpdateFilterById(chatId));
}
