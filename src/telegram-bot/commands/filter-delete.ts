import { CommandBuilderType, CustomArgv, CustomArgvHandler, CustomExtend } from 'telegram-bot/cli';
import { deleteFilterById } from 'utils/filter';
import { Argv } from 'yargs';

const COMMAND = 'filter-delete';
const DESCRIPTION = 'Delete filter';

function buildDeleteFilterById<O extends CustomExtend>(chatId: string): CustomArgvHandler<O> {
  return async (argv: CustomArgv<O>) => {
    const filterId = 'filterId';
    let result: any = await deleteFilterById(chatId, filterId);
    result = 'deleteFilterById executed success';
    argv.respond(result);
  };
}

export function adddDeleteFilterByIdCommand<T>({ chatId, argv }: CommandBuilderType<T>): Argv<T> {
  return argv.command(COMMAND, DESCRIPTION, {}, buildDeleteFilterById(chatId));
}
