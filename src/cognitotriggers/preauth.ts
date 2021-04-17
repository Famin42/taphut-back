import {
  Callback,
  Context,
  PreAuthenticationTriggerEvent,
  PreAuthenticationTriggerHandler,
} from 'aws-lambda';

import logger, { setDebugLevel } from 'utils/logger';
import { ReCaptchaAction, verifyReCaptcha } from 'utils/recaptcha';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

export const handler: PreAuthenticationTriggerHandler = async (
  event: PreAuthenticationTriggerEvent,
  _context: Context,
  callback: Callback
) => {
  logger.info(`event is ${JSON.stringify(event)}`);

  const { request } = event;
  const { userAttributes, validationData } = request;
  const { email } = userAttributes;

  try {
    if (email && email !== email?.toLowerCase()) {
      // we require that email addresses are lowercase. The frontend enforces
      // this, and we check here to be sure.
      throw new Error(`Error with ${email}: email address must be lowercase.`);
    }

    await verifyReCaptcha({
      token: validationData?.recaptchaToken,
      expectedAction: ReCaptchaAction.SIGN_IN,
    });
  } catch (error) {
    callback(error.message, event);
  }

  return event;
};
