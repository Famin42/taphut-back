import { AppSyncResolverEvent, Callback, Context } from 'aws-lambda';

import { getUsersByAdmin, ICognitoPaginationParams, IUserType } from 'utils/cognito';
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
  event: AppSyncResolverEvent<ICognitoPaginationParams>,
  _context: Context,
  callback: Callback<{
    PaginationToken?: string;
    Users: IUserType[];
  }>
): Promise<void> {
  logger.info(`event is ${JSON.stringify(event)}`);
  const { Limit, PaginationToken } = event?.arguments || {};

  try {
    const data = await getUsersByAdmin({ Limit, PaginationToken });
    logger.info(`result is:`);
    logger.info(`${JSON.stringify(data)}`);
    callback(null, { PaginationToken: data.PaginationToken, Users: data.Users });
  } catch (error) {
    logger.error(`ERROR: ${error.message}`);
    callback(error.message);
  }
}
