import { SSM } from 'aws-sdk';

import ExpiryCache from 'utils/expirycache';

const ssm = new SSM({ apiVersion: '2014-11-06' });

/**
 * Caches the result of an SSM lookup call and refreshes it every X seconds. SSM is an AWS
 * service which allows secure remote storage of variables.
 */
class ConfigVar {
  private value: string | undefined;
  private cache: ExpiryCache<string | undefined>;

  /**
   * Create Lambda config var
   * @param override if defined, override config var with this
   * @param ssmVarName variable name in SSM store
   * @param expiryMs cache will expire after this many ms
   */
  constructor({
    override,
    ssmVarName,
    decrypt = true,
    expiryMs = 60000,
  }: {
    override?: string;
    ssmVarName: string;
    decrypt?: boolean;
    expiryMs?: number;
  }) {
    // the environment variable (used for testing) overrides SSM
    if (override !== undefined) {
      this.value = override;
      return;
    }

    const fetcher = async () => {
      const response = await ssm
        .getParameter({ Name: ssmVarName, WithDecryption: decrypt })
        .promise();
      if (!response.Parameter) {
        throw Error(`Error reading SSM Parameter: ${ssmVarName}`);
      }
      return response.Parameter.Value;
    };

    this.cache = new ExpiryCache(expiryMs, fetcher);
  }

  /**
   * get environment variable value if it was defined, otherwise read from SSM
   * in a caching way
   */
  public async get() {
    if (this.value) {
      return this.value;
    }
    return this.cache.get();
  }
}

export default ConfigVar;
