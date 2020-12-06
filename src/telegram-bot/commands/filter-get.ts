import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { filterToString } from 'utils/converters/filter';
import { getFilterById, IFIlter } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = 'filter-get';
const DESCRIPTION = 'Get filter by name';
const EXAMPLE = 'filter-get -n filterName';

function buildGetFilterById<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    const filterName = argv.name as string;
    const filter: IFIlter | undefined = await getFilterById(chatId, filterName);

    if (filter) {
      argv.respond(filterToString(filter));
    } else {
      argv.respond(`"${filterName}" filter doesn't exist!`);
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
