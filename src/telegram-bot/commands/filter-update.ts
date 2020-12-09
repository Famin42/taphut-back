import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { Currency, IFIlter, updateFilterById } from 'utils/filter';
import { filterToString } from 'utils/converters/filter';
import { Argv } from 'yargs';
import { ItemNotFoundError } from 'utils/dynamodb';

const COMMAND = ['filter-update', 'fu'];
const DESCRIPTION = 'Update filter';
const EXAMPLE = 'fu -n filterName -c City --cr USD --min 100 --max 350 -r 2';

const ERROR_MESSAGE = 'Some error occurred during deleting the filter.';

function buildUpdateFilterById<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    const { name, city, currency, min, max, rooms } = argv;
    try {
      const updatedFilter: IFIlter = {
        filterName: name as string,
        city: city as string | undefined,
        currency: currency as Currency,
        minPrice: min as number | undefined,
        maxPrice: max as number | undefined,
        roomsNumber: rooms as number | undefined,
      };

      const { filter } = await updateFilterById(chatId, updatedFilter);

      const msg = filterToString(filter, `Filter "${name as string}" is updated successfully.\n`);

      argv.respond(msg);
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        argv.respond(`"${name}" filter doesn't exist!`);
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
      describe: 'filter name',
      type: 'string',
    })
    .options('c', {
      alias: 'city',
      demandOption: false,
      describe: 'city',
      type: 'string',
    })
    .options('cr', {
      alias: 'currency',
      demandOption: false,
      describe: 'currency',
      type: 'string',
      default: 'USD',
      choices: ['USD', 'BYN'],
    })
    .options('min', {
      demandOption: false,
      describe: 'min price',
      type: 'number',
    })
    .options('max', {
      demandOption: false,
      describe: 'max price',
      type: 'number',
    })
    .options('r', {
      alias: 'rooms',
      demandOption: false,
      describe: 'number of rooms',
      type: 'number',
    })
    .example(EXAMPLE, '');
};

export function adddUpdateFilterByIdCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, defineCommandParameter, buildUpdateFilterById(chatId));
}
