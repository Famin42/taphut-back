import {
  Callback,
  Context,
  CustomMessageTriggerEvent,
  CustomMessageTriggerHandler,
} from 'aws-lambda';

import { ReCaptchaAction, ReCaptchaValidationError, verifyReCaptcha } from 'utils/recaptcha';
import logger, { setDebugLevel } from 'utils/logger';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

/**
 * events that we handle:
 * CustomMessage_ForgotPassword
 *
 * not handled events:
 * CustomMessage_UpdateUserAttribute
 * CustomMessage_VerifyUserAttribute
 * CustomMessage_SignUp
 * CustomMessage_ResendCode
 * CustomMessage_Authentication       To send MFA code during authentication.
 * CustomMessage_AdminCreateUser      To send the temporary password to a new user.
 */
export const handler: CustomMessageTriggerHandler = async (
  event: CustomMessageTriggerEvent,
  _context: Context,
  callback: Callback<any>
) => {
  logger.info(event);

  const { triggerSource, request } = event;
  const { clientMetadata } = request;

  try {
    if (triggerSource === 'CustomMessage_ForgotPassword') {
      await verifyReCaptcha({
        token: clientMetadata?.recaptchaToken,
        expectedAction: ReCaptchaAction.FORGOT_PASSWORD,
      });
    }

    callback(null, event);
  } catch (error) {
    logger.error(error);
    if (error instanceof ReCaptchaValidationError) {
      throw new Error('We couldn’t validate your reset password request. Please try again.');
    }
    throw error;
  }
};
