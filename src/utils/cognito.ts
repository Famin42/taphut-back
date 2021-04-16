import { CognitoIdentityServiceProvider } from 'aws-sdk';
import logger from './logger';
import { newErrorType } from './errors';
import {
  AdminListUserAuthEventsRequest,
  AdminListUserAuthEventsResponse,
  AuthEventType,
  AdminGetUserResponse,
  UserType,
} from 'aws-sdk/clients/cognitoidentityserviceprovider';

export const cognito = new CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18',
});

export const USER_POOL_ID = process.env.USER_POOL_ID || '';

if (USER_POOL_ID.length === 0) {
  logger.error('No USER_POOL_ID environment variable specified!');
}

export const UserNotFoundError = newErrorType('UserNotFoundError');

/**
 * lookup user id from email address
 * @param {string} email
 * @returns {Promise<string>} user id
 * @constructor
 */
export async function getUserIDByEmail(email: string): Promise<string> {
  let listUsersResult;
  try {
    listUsersResult = await cognito
      .listUsers({
        UserPoolId: USER_POOL_ID,
        Filter: `email=\"${email}\"`,
      })
      .promise();
  } catch (e) {
    logger.info(`rejected: ${e}`);
    throw e;
  }

  if (
    !listUsersResult.Users ||
    listUsersResult.Users.length === 0 ||
    !listUsersResult.Users[0].Username
  ) {
    throw new UserNotFoundError('no matching user for email');
  }

  return listUsersResult.Users[0].Username;
}

export interface ISimpleUser {
  user: UserType;
  attributeMap: Map<string, string>;
}

export interface IUser {
  user: AdminGetUserResponse;
  attributeMap: Map<string, string>;
}

/**
 * Look up attributes and other info about a user
 * @param userid uuid userid / username from Cognito
 */
export async function getUser(userid: string): Promise<IUser> {
  const user = await cognito
    .adminGetUser({
      UserPoolId: USER_POOL_ID,
      Username: userid,
    })
    .promise();

  if (user.UserAttributes === undefined) {
    throw new Error(`getUser(${userid}): no UserAttributes returned!`);
  }

  const attrList = user.UserAttributes.map((attr): [string, string] => [
    attr.Name,
    attr.Value || '',
  ]);
  const fullUser: IUser = {
    user,
    attributeMap: new Map(attrList),
  };
  return fullUser;
}

/**
 * A compact, flat representation of {CognitoIdentityServiceProvider.AuthEventType}
 */
export interface IAuthEvent {
  id?: string;
  type?: string;
  creationDate?: string;
  response?: string;
  riskDecision?: string;
  ipAddress?: string;
  deviceName?: string;
  city?: string;
  country?: string;
}

/**
 * convert {CognitoIdentityServiceProvider.AuthEventType} to a more compact {IAuthEvent}
 * @param {CognitoIdentityServiceProvider.AuthEventType} e
 * @returns {IAuthEvent}
 */
function sanitizeAuthEvent(e: AuthEventType): IAuthEvent {
  const res: IAuthEvent = {
    id: e.EventId,
    type: e.EventType,
    creationDate: e.CreationDate ? e.CreationDate.toISOString() : undefined,
    response: e.EventResponse,
  };

  if (e.EventRisk) {
    res.riskDecision = e.EventRisk.RiskDecision;
  }

  if (e.EventContextData) {
    res.ipAddress = e.EventContextData.IpAddress;
    res.deviceName = e.EventContextData.DeviceName;
    res.city = e.EventContextData.City;
    res.country = e.EventContextData.Country;
  }

  return res;
}

/**
 * To be used as MAX_RESULT for the AdminListUserAuthEvents query
 * @type {number}
 */
const MAX_AUTH_EVENTS = 20;

/**
 * Return latest auth events for user
 * Currently supports a maximum 20 events
 * @param {string} userId
 * @returns {Promise<{authEvents: IAuthEvent[] | any[]}>}
 */
export async function getAuthEvents(
  userId: string,
  NextToken: string | undefined = undefined,
  MaxResults: number = MAX_AUTH_EVENTS
): Promise<{
  authEvents: IAuthEvent[];
  nextToken?: string;
}> {
  const params: AdminListUserAuthEventsRequest = {
    UserPoolId: USER_POOL_ID,
    Username: userId,
    MaxResults,
    NextToken,
  };

  const authEventsResult: AdminListUserAuthEventsResponse = await cognito
    .adminListUserAuthEvents(params)
    .promise();

  return {
    nextToken: authEventsResult.NextToken,
    authEvents: authEventsResult.AuthEvents
      ? authEventsResult.AuthEvents.map(sanitizeAuthEvent)
      : [],
  };
}

/**
 * Get the timestamp of the creation of a given user account
 * @param userId userid / username from Cognito
 */
export async function getAccountCreationDate(userId: string): Promise<Date | undefined> {
  const { user } = await getUser(userId);
  return user.UserCreateDate;
}

/**
 * Fetch users by their email (or email prefix)
 * @param {string} emailSearchStr email prefix to serach for
 */
export async function getUsersByEmail(
  emailSearchStr: string
): Promise<CognitoIdentityServiceProvider.UserType[]> {
  let userList: CognitoIdentityServiceProvider.UserType[] = [];
  let PaginationToken: string | undefined;
  const Limit = 50;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await cognito
      .listUsers({
        UserPoolId: USER_POOL_ID,
        Filter: `email ^= "${emailSearchStr}"`,
        PaginationToken,
        Limit,
      })
      .promise();
    ({ PaginationToken } = res);
    const users = res.Users || [];
    userList = userList.concat(users);
    if (users.length < Limit) {
      break;
    }
  }
  return userList;
}
