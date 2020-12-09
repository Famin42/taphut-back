/**
 * Create a new error class that inherits from Error
 * This handles the idiosyncrasies of extending errors in typescript:
 * https://github.com/Microsoft/TypeScript/issues/13965
 * @param {string} name for the error class
 * @returns {TypedErrorClass} an error class with above name that extends Error
 */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function newErrorType(name: string) {
  class TypedErrorClass extends Error {
    constructor(message: string) {
      super(message);
      this.name = name;
      Object.setPrototypeOf(this, TypedErrorClass.prototype);
    }
  }
  return TypedErrorClass;
}

/**
 * Wrap a message as an error for a GraphQL Lambda to return
 * @param message error message (usually from err.message in catch)
 */
export function graphqlError(message: string): { error: string } {
  return { error: message };
}
