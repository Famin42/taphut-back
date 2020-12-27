import { graphqlError } from 'utils/errors';
import { IUserInfo, getUserInfo } from 'utils/user';
import logger, { setDebugLevel } from 'utils/logger';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { getUserIDByEmail, USER_POOL_ID, UserNotFoundError } from 'utils/cognito';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

const cognito = new CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18',
});

/**
 * Handle an admin GraphQL request to delete a user's account. Supports
 * lookup by userid or email
 *
 * If a userid is provided, we will use it to delete all information associated
 * with the userid if we can find it. If an email address is provided, we will
 * find the corresponding userid by the email.
 * In summary, the precedence is as the following:
 * userid => email
 *
 * @param event
 * @param context
 * @param callback
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function handler(event: any, _context: any, callback: any): Promise<void> {
  logger.info(`event is ${JSON.stringify(event)}`);

  let userids;
  const { email, userid } = event.arguments;

  if (userid) {
    userids = [userid];
  } else if (email) {
    try {
      userids = [await getUserIDByEmail(email)];
    } catch (e) {
      if (e instanceof UserNotFoundError) {
        logger.info(`no userid found under ${email}`);
      }
    }
  }

  if (!userids || userids.length === 0 || !userids[0]) {
    callback(null, graphqlError('No user found!'));
    return;
  }

  const results: IUserInfo[] = [];
  for (const uid of userids) {
    try {
      results.push(await getUserInfo(uid));
    } catch (e) {
      logger.error(`Error getting user info for ${uid}: ${e.toString()}`);
      callback(null, { users: results });
      return;
    }

    try {
      await deleteUserAccounts(uid);
    } catch (e) {
      logger.error(`Error deleting user info for ${uid}: ${e.toString()}`);
      callback(null, { users: results.slice(0, results.length - 1) });
      return;
    }
  }
  callback(null, { users: results });
}

/**
 * deleteUserAccounts delete user information from
 * 1. Cognito user
 *
 * @param uid
 */
async function deleteUserAccounts(uid: string) {
  await Promise.all([deleteUserInfoFromCognito(uid)]);
}

async function deleteUserInfoFromCognito(uid: string) {
  try {
    logger.info(`Deleting ${uid} from Cognito`);
    const result = await cognito
      .adminDeleteUser({
        UserPoolId: USER_POOL_ID,
        Username: uid,
      })
      .promise();
    logger.info(result);
  } catch (e) {
    logger.error(`deleteUserInfoFromCognito error for ${uid}: ${e.toString()}`);
    throw e;
  }
}
