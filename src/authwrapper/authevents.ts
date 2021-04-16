import { AppSyncResolverEvent, Callback, Context } from 'aws-lambda';

import { getAuthEvents, IAuthEvent } from 'utils/cognito';
import logger, { setDebugLevel } from 'utils/logger';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

interface IPaginationArg {
  limit?: string;
  nextToken?: string;
}

/**
 * Handle a private GraphQL request to delete a user's filter.
 *
 * @param event
 * @param _context
 * @param callback
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function handler(
  event: AppSyncResolverEvent<IPaginationArg>,
  _context: Context,
  callback: Callback<{
    authEvents: IAuthEvent[];
    nextToken?: string;
  }>
) {
  logger.info(`event is ${JSON.stringify(event)}`);
  const { identity } = event;
  const { limit, nextToken } = event.arguments;

  let authEventsResult;

  if (typeof limit === 'number' && !isNaN(limit)) {
    authEventsResult = await getAuthEvents(identity?.username as string, nextToken, limit);
  } else {
    authEventsResult = await getAuthEvents(identity?.username as string, nextToken);
  }
  callback(null, authEventsResult);
}
