import { graphqlError } from 'utils/errors';
import { getUsersByEmail } from 'utils/cognito';
import { getUserInfo, IUserInfo } from 'utils/user';
import logger, { setDebugLevel } from 'utils/logger';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

/**
 * Handle an admin GraphQL request to get detailed info on a user. Supports
 * lookup by email, stellarKey, or userid
 */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function handler(event: any, _context: any, callback: any): Promise<void> {
  logger.info(`event is ${JSON.stringify(event)}`);

  let userids;
  const { email, userid } = event.arguments;

  if (email) {
    const users = await getUsersByEmail(email);
    userids = users.map((u) => u.Username).filter((u) => !!u);
  } else if (userid) {
    userids = [userid];
  }

  if (!userids || userids.length === 0 || !userids[0]) {
    callback(null, graphqlError('No user found!'));
    return;
  }

  const results: IUserInfo[] = [];

  for (const uid of userids) {
    results.push(await getUserInfo(uid));
  }

  callback(null, { users: results });
}
