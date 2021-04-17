import * as FormData from 'form-data';
import fetch from 'node-fetch';

import { newErrorType } from './errors';
import ConfigVar from './config';
import logger from './logger';

const MIN_RE_CAPTCHA_SCORE = 0.4;
const TIMEOUT = 10000;
const GOOGLE_VERIFY_RECAPTCHA_URL = 'https://www.google.com/recaptcha/api/siteverify';

const recaptchaSecretKeyConfig = new ConfigVar({
  ssmVarName: 'recaptchaSecretKey',
});

export const ReCaptchaValidationError = newErrorType('ReCaptchaValidationError');

export const enum ReCaptchaAction {
  FORGOT_PASSWORD = 'forgotPassword',
  SIGN_IN = 'signIn',
  SIGN_UP = 'signUp',
}

const enum ReCaptchaError {
  // The secret parameter is missing.
  MISSING_INPUT_SECRET = 'missing-input-secret',
  // The secret parameter is invalid or malformed.
  INVALID_INPUT_SECRET = 'invalid-input-secret',
  // The response parameter is missing.
  MISSING_INPUT_RESPONSE = 'missing-input-response',
  // The response parameter is invalid or malformed.
  INVALID_INPUT_RESPONSE = 'invalid-input-response',
  // The request is invalid or malformed.
  BAD_REQUEST = 'bad-request',
  // The response is no longer valid; either is too old or has been used previously.
  TIMEOUT_OR_DUPLICATE = 'timeout-or-duplicate',
}

/**
 * @success whether this request was a valid reCAPTCHA token for your site
 * @score the score for this request (0.0 - 1.0)
 * @action  the action name for this request (important to verify)
 * @challegne_ts timestamp of the challenge load (ISO format)
 * @hostname the hostname of the site where the reCAPTCHA was solved
 * @error_codes optional errors
 */
interface IReCaptchaVerificationResponse {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  score: number;
  action: ReCaptchaAction;
  'error-codes'?: ReCaptchaError[];
}

interface IReCaptchaVerificationParams {
  token: string | undefined;
  expectedAction: ReCaptchaAction;
}

/**
 * if verifying recaptcha token will failed, it will raise the error
 * @param obj recaptcha temporary token with expected action
 * @returns void
 */
export async function verifyReCaptcha({
  token,
  expectedAction,
}: IReCaptchaVerificationParams): Promise<void> {
  if (!token) {
    throw new ReCaptchaValidationError('Missing recaptcha token');
  }

  const form: FormData = await formGoogleRecaptchaVerification(token);

  try {
    const response = await fetch(GOOGLE_VERIFY_RECAPTCHA_URL, {
      method: 'POST',
      body: form,
      timeout: TIMEOUT,
    });

    const data: IReCaptchaVerificationResponse = await response.json();
    logger.info(`recaptcha response: ${JSON.stringify(data)}`);

    const { score, success, action } = data;
    const isVerificationFailed = !(
      success &&
      score > MIN_RE_CAPTCHA_SCORE &&
      action === expectedAction
    );

    if (isVerificationFailed) {
      throw new ReCaptchaValidationError('Recaptcha verification failed');
    }

    logger.info(`Success verification of recaptcha`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function formGoogleRecaptchaVerification(
  recaptchaToken: string
  // remoteip: string | undefined = undefined,
): Promise<FormData> {
  const recaptchaSecretKey = await recaptchaSecretKeyConfig.get();

  if (!recaptchaSecretKey) {
    throw new Error('No recaptcha secret key provided');
  }

  const form = new FormData();
  form.append('secret', recaptchaSecretKey);
  form.append('response', recaptchaToken);
  // remoteip is optional;
  // form.append("remoteip", remoteip);

  return form;
}
