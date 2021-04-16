import { getAuthEvents, getUser, IAuthEvent, IUser } from './cognito';

interface IPair {
  key: string;
  value: string;
}

interface IUserObj {
  userid: string;
  createDate?: Date;
  lastModifiedDate?: Date;
  enabled?: boolean;
  userStatus?: string;
  preferredMfaSetting?: string;
  mfaSettingList?: string[];
  attributes: IPair[];
}

export interface IUserInfo {
  user: IUserObj;
  lastLogin: IAuthEvent;
  authEvents: IAuthEvent[];
}

export async function getUserInfo(uid: string): Promise<IUserInfo> {
  const [user, authEvents] = await Promise.all([getUser(uid), getAuthEvents(uid)]);

  return {
    user: userToUserObj(user),
    lastLogin: authEvents.authEvents[0],
    authEvents: authEvents.authEvents,
  };
}

/**
 * Convert an IUser into an IUserObj
 * @param u user to convert
 */
function userToUserObj(u: IUser): IUserObj {
  const { user } = u;
  return {
    userid: user.Username,
    createDate: user.UserCreateDate,
    lastModifiedDate: user.UserLastModifiedDate,
    enabled: user.Enabled,
    userStatus: user.UserStatus,
    preferredMfaSetting: user.PreferredMfaSetting,
    mfaSettingList: user.UserMFASettingList,
    attributes: [...u.attributeMap.entries()].map(([key, value]) => ({
      key,
      value,
    })),
  };
}
