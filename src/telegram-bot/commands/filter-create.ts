import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { filterToString } from 'utils/converters/filter';
import { createFilter, Currency, IFIlter } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = ['filter-create', 'fc'];
const DESCRIPTION = 'Create filter';
const EXAMPLE = 'fc -n filterName -c City --cr USD --min 100 --max 350 -r 2';

const ERROR_MESSAGE = 'Some error occurred during creating the filter.';

function buildCreateFilter<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    try {
      const { name, city, currency, min, max, rooms } = argv;

      const filter: IFIlter = {
        filterName: name as string,
        city: city as string | undefined,
        currency: currency as Currency,
        minPrice: min as number | undefined,
        maxPrice: max as number | undefined,
        roomsNumber: rooms as number | undefined,
      };

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

const defineCommandParameter: any = <T>(argv: Argv<T>) => {
  return argv
    .option('n', {
      alias: 'name',
      demandOption: true,
      describe: 'filter name',
      type: 'string',
    })
    .option('c', {
      alias: 'city',
      demandOption: false,
      describe: 'city',
      type: 'string',
    })
    .option('cr', {
      alias: 'currency',
      demandOption: false,
      describe: 'currency',
      type: 'string',
      default: 'USD',
      choices: ['USD', 'BYN'],
    })
    .option('min', {
      demandOption: false,
      describe: 'min price',
      type: 'number',
    })
    .option('max', {
      demandOption: false,
      describe: 'max price',
      type: 'number',
    })
    .option('r', {
      alias: 'rooms',
      demandOption: false,
      describe: 'number of rooms',
      type: 'number',
    })
    .example(EXAMPLE, '');
};

export function adddCreateFilterCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, defineCommandParameter, buildCreateFilter(chatId));
}
