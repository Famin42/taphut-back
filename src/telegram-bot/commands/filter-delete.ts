import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { filterToString } from 'utils/converters/filter';
import { deleteFilterById } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = 'filter-delete';
const DESCRIPTION = 'Delete filter';

const ERROR_MESSAGE = 'Some error occurred during deleting the filter.';

function buildDeleteFilterById<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    try {
      const filterName = 'MOCK_FILTER_5';
      const filter = await deleteFilterById(chatId, filterName);

      const msg = filterToString(filter, `Filter "${filterName}" is deleted successfully.\n`);

      argv.respond(msg);
    } catch (error) {
      const errMsg = error?.message || ERROR_MESSAGE;
      argv.respond(errMsg);
    }
  };
}

export function adddDeleteFilterByIdCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, {}, buildDeleteFilterById(chatId));
}
