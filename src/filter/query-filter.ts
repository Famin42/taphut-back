import { AppSyncResolverEvent, Callback, Context } from 'aws-lambda';

import { getFilterById, getFilters, IFilterRow } from 'utils/filter';
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
  event: AppSyncResolverEvent<{ chatId: string; filterName?: string }>,
  _context: Context,
  callback: Callback<IFilterRow | IFilterRow[]>
): Promise<void> {
  logger.info(`event is ${JSON.stringify(event)}`);
  const { chatId, filterName } = event?.arguments || {};

  if (filterName) {
    // filterByName query
    const filter: IFilterRow = await getFilterById(chatId, filterName);
    callback(null, filter);
  } else {
    // filters query
    const { Items } = await getFilters(chatId);
    callback(null, Items);
  }
}
