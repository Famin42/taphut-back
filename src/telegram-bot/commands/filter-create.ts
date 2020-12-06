import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { filterToString } from 'utils/converters/filter';
import { createFilter, IFIlter } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = 'filter-create';
const DESCRIPTION = 'Create filter';

const ERROR_MESSAGE = 'Some error occurred during creating the filter.';

function buildCreateFilter<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    const filter: IFIlter = {
      filterName: 'some_filter',
    };
    try {
      const createdFilter = await createFilter(chatId, filter);

      const msg = filterToString(
        createdFilter,
        `Filter ${filter.filterName} is created successfully.\n`
      );

      argv.respond(msg);
    } catch (error) {
      const errMsg = error?.message || ERROR_MESSAGE;
      argv.respond(errMsg);
    }
  };
}

export function adddCreateFilterCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, {}, buildCreateFilter(chatId));
}
