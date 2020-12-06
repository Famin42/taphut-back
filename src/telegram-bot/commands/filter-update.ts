import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { IFIlter, updateFilterById } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = 'filter-update';
const DESCRIPTION = 'Update filter';

function buildUpdateFilterById<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    const filterId = 'filterId';
    const newFilter: Partial<Omit<IFIlter, 'id'>> = {};
    let result: any = await updateFilterById(chatId, filterId, newFilter);
    result = 'updateFilterById executed success';
    argv.respond(result);
  };
}

export function adddUpdateFilterByIdCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, {}, buildUpdateFilterById(chatId));
}
