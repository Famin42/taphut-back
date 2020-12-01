/**
 * Get environment variable
 * throws an error if not present
 * @param key
 */
export function mustEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`environment variable missing for key: ${key}`);
  }
  return val;
}
