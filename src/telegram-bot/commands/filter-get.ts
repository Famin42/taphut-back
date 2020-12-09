import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { filterToString } from 'utils/converters/filter';
import { ItemNotFoundError } from 'utils/dynamodb';
import { getFilterById } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = ['filter-get', 'fg'];
const DESCRIPTION = 'Get filter by name';
const EXAMPLE = 'filter-get -n filterName';

const ERROR_MESSAGE = 'Some error occurred during getting the filter.';

function buildGetFilterById<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    const filterName = argv.name as string;
    try {
      const { filter } = await getFilterById(chatId, filterName);
      argv.respond(filterToString(filter));
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        argv.respond(`"${filterName}" filter doesn't exist!`);
      } else {
        argv.respond(error?.message || ERROR_MESSAGE);
      }
    }
  };
}

const defineCommandParameter: any = <T>(argv: Argv<T>) => {
  return argv
    .options('n', {
      alias: 'name',
      demandOption: true,
      describe: 'Filter name',
      type: 'string',
    })
    .example(EXAMPLE, DESCRIPTION);
};

export function adddGetFilterByIdCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, defineCommandParameter, buildGetFilterById(chatId));
}
