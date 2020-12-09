import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { filterToString } from 'utils/converters/filter';
import { ItemNotFoundError } from 'utils/dynamodb';
import { deleteFilterById } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = ['filter-delete', 'fd'];
const DESCRIPTION = 'Delete filter';
const EXAMPLE = 'filter-delete -n filterName';

const ERROR_MESSAGE = 'Some error occurred during deleting the filter.';

function buildDeleteFilterById<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    const filterName = argv.name as string;

    try {
      const { filter } = await deleteFilterById(chatId, filterName);

      const msg = filterToString(filter, `Filter "${filterName}" is deleted successfully.\n`);

      argv.respond(msg);
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

export function adddDeleteFilterByIdCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, defineCommandParameter, buildDeleteFilterById(chatId));
}
