import logger from 'utils/logger';
import { newErrorType } from './errors';

/**
 * asynchronously sleep for the specified number of milliseconds
 * @param ms milliseconds to sleep
 */
export function sleep<T = unknown>(ms: number): Promise<T> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const RejectAfter = newErrorType('RejectAfter');

/**
 * Wait the specified number of milliseconds, and then reject
 * @param ms milliseconds to sleep
 */
export function rejectAfter<T>(ms: number): Promise<T> {
  return new Promise((_resolve, reject) =>
    setTimeout(() => {
      const e = new RejectAfter(`rejected after ${ms} ms`);
      reject(e);
    }, ms)
  );
}

/**
 * Runs an async function across a list in parallel, but limit number of tasks
 * running at once
 * @param {Array} list items to process
 * @param {function} func async function to process items
 * @param {number} limit max number of async tasks to run at once
 * @param {number} timeout give up on individual calls after this many milliseconds
 * @returns {U[]} array of return values of funcs
 */
export async function eachLimit<T, U>(
  list: T[],
  func: (x: T) => Promise<U>,
  limit = 10,
  timeout = 0
): Promise<U[]> {
  const inFlight = new Set();
  const results: U[] = [];

  for (let i = 0; i < list.length; i += 1) {
    if (inFlight.size >= limit) {
      // logger.debug(`Waiting: ${i}, ${inFlight.size}...`);
      //  returns first resolved promise
      await Promise.race(inFlight);
    }
    // logger.debug(`Done waiting! ${i} ${inFlight.size}`);

    const wrapper = async (ind: number) => {
      // the wrapper stores the result of the function
      if (timeout) {
        try {
          results[ind] = await Promise.race([func(list[ind]), rejectAfter<U>(timeout)]);
        } catch (e) {
          if (e instanceof RejectAfter) {
            logger.error(
              `eachLimit: Call ${ind} timed out after ${timeout} ms. Arg: ${JSON.stringify(
                list[ind]
              )}`
            );
            return;
          }
          throw e;
        }
      } else {
        results[ind] = await func(list[ind]);
      }
      // logger.debug(`Function ${ind} complete.`);
    };

    // start the function
    const promise = wrapper(i);
    // Add promise to inFlight Set
    inFlight.add(promise);
    // once the promise is complete, remove it from the inFlight set
    promise.then(() => {
      // logger.debug(`Deleting.`);
      inFlight.delete(promise);
    });
  }

  // logger.debug(`Final cleanup: ${inFlight.size}`);
  await Promise.all(inFlight);
  return results;
}

interface IRetryNTimes<T> {
  func: () => Promise<T>;
  timeOut?: number;
  maxTries?: number;
  shouldRetryErrors?: boolean;
}

/**
 * Wraps an async function for multiple tries. Use for unreliable calls
 *
 * @param myFunction Function to be retried
 * @param timeOut Give up on try X after this length of time
 * @param maxTries Give up altogether after this many tries
 * @param shouldRetryErrors true to retry on non-timeout errors
 */
export async function retryNTimes<T = unknown>({
  func,
  timeOut = 2000,
  maxTries = 5,
  shouldRetryErrors = false,
}: IRetryNTimes<T>): Promise<T> {
  for (let i = 0; i < maxTries; i += 1) {
    try {
      return await Promise.race([func(), rejectAfter<T>(timeOut)]);
    } catch (e) {
      logger.error({
        attempt: i + 1,
        err: JSON.stringify(e),
      });

      if (e instanceof RejectAfter) {
        // This is a timeout, try again
      } else {
        // This is a real error from the server, maybe don't retry
        if (!shouldRetryErrors) {
          throw e;
        }
      }
    }
  }
  throw new Error(`Failed after ${maxTries} tries`);
}
