import { AppSyncResolverEvent, Callback, Context } from 'aws-lambda';

import { IFilter, IFilterRow, updateFilterById } from 'utils/filter';
import logger, { setDebugLevel } from 'utils/logger';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

/**
 * Handle a private GraphQL request to delete a user's filter.
 *
 * @param event
 * @param _context
 * @param callback
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function handler(
  event: AppSyncResolverEvent<{ chatId: string; filter: IFilter }>,
  _context: Context,
  callback: Callback<IFilterRow>
): Promise<void> {
  logger.info(`event is ${JSON.stringify(event)}`);
  const { chatId, filter } = event?.arguments || {};

  const updatedFilter: IFilterRow = await updateFilterById(chatId, filter);
  callback(null, updatedFilter);
}
