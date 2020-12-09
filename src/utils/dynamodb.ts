import { mapValues, pickBy } from 'lodash';
import { AWSError, DynamoDB } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';

import { newErrorType } from 'utils/errors';
import { eachLimit } from 'utils/async';
import logger from './logger';

export const ItemNotFoundError = newErrorType('ItemNotFoundError');
export const AttrNotFoundError = newErrorType('AttrNotFoundError');

function isOffline() {
  return !!process.env.DYNAMODB_ENDPOINT;
}

const options = isOffline()
  ? {
      region: 'localhost',
      endpoint: process.env.DYNAMODB_ENDPOINT,
      apiVersion: '2012-08-10',
    }
  : { apiVersion: '2012-08-10', region: 'us-east-1' };

const dynamodb = {
  doc: new DynamoDB.DocumentClient(options),
  db: new DynamoDB(options),
};

interface IParallelPutItems<T>
  extends Pick<DynamoDB.DocumentClient.PutItemInput, 'TableName' | 'ConditionExpression'> {
  Items: T[];
  parallelism?: number;
}

/**
 * put items into a dynamodb with a specified level of parallelism
 * @param {DynamoDB.DocumentClient} dbd dynamodb client
 * @param {Object[]} items items to insert
 * @param {string} table table to insert into
 * @param {integer} parallelism number of concurrent requests to execute at once
 * @param {string} conditionExpression condition that must be true for write to go through
 * @returns {Array} list of promises to put results
 */
export function DynamoDB_ParallelPut<T>({
  Items,
  parallelism = 5,
  ...params
}: IParallelPutItems<T>): Promise<
  PromiseResult<DynamoDB.DocumentClient.PutItemOutput, AWSError>[]
> {
  const putRequests = Items.map((Item) => ({ Item, ...params }));
  return eachLimit(
    putRequests,
    (
      item: Pick<DynamoDB.DocumentClient.PutItemInput, 'TableName' | 'Item' | 'ConditionExpression'>
    ) => DynamoDB_Put(item),
    parallelism
  );
}

/**
 * A convenience wrapper around DynamoDB put
 * Put a single item into table
 * @param TableName
 * @param Item
 * @param ConditionExpression
 
 */
export async function DynamoDB_Put(
  params: DynamoDB.DocumentClient.PutItemInput
): Promise<PromiseResult<DynamoDB.DocumentClient.PutItemOutput, AWSError>> {
  const result = await dynamodb.doc.put(params).promise();

  if (result?.$response?.error) {
    logger.error(`Error happened during run "dynamodb.doc.put"`);
    logger.error(`params: ${JSON.stringify(params)}`);
    logger.error(`resut: ${JSON.stringify(result)}`);
    throw new Error(`Could not put into DynamoDB: ${JSON.stringify(params)}`);
  }

  return result;
}

interface IParallelDeleteParams {
  Keys: DynamoDB.DocumentClient.Key[];
  TableName: DynamoDB.DocumentClient.TableName;
  parallelism?: number;
}

/**
 * delete dynamodb items with a specified level of parallelism
 * @param {DynamoDB.DocumentClient} dbd dynamodb client
 * @param {Object[]} keys keys to delete
 * @param {string} table table to delete from
 * @param {int} parallelism number of concurrent requests to execute at once
 */
export function DynamoDB_ParallelDelete({
  Keys,
  TableName,
  parallelism = 5,
}: IParallelDeleteParams): Promise<
  PromiseResult<DynamoDB.DocumentClient.DeleteItemOutput, AWSError>[]
> {
  const deletes = Keys.map((Key) => ({
    TableName,
    Key,
  }));
  return eachLimit(
    deletes,
    (params: DynamoDB.DocumentClient.DeleteItemInput) => DynamoDB_Delete(params),
    parallelism
  );
}

/**
 * A convenience wrapper around DynamoDB put
 * Delete an item from table
 * @param TableName
 * @param Key
 * @param ConditionExpression
 * @param Expected
 * @param ConditionalOperator
 * @param ReturnConsumedCapacity
 * @param ReturnItemCollectionMetrics
 * @param ConditionExpression
 * @param ExpressionAttributeNames
 * @param ExpressionAttributeValues
 * @param {string} ReturnValues "NONE", "ALL_OLD", "ALL_NEW", etc...: what to return:
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#update-property
 */
export async function DynamoDB_Delete(
  params: DynamoDB.DocumentClient.DeleteItemInput
): Promise<PromiseResult<DynamoDB.DocumentClient.DeleteItemOutput, AWSError>> {
  const result = await dynamodb.doc.delete(params).promise();

  if (result?.$response?.error) {
    logger.error(`Error happened during run "dynamodb.doc.delete"`);
    logger.error(`params: ${JSON.stringify(params)}`);
    logger.error(`resut: ${JSON.stringify(result)}`);
    throw new Error(`Could not delete from DynamoDB: ${JSON.stringify(params)}`);
  }

  return result;
}

type DynamoDBGetParams = Pick<DynamoDB.DocumentClient.GetItemInput, 'TableName' | 'Key'>;
interface IParallelGetParams extends Pick<DynamoDB.DocumentClient.GetItemInput, 'TableName'> {
  parallelism?: number;
}

/**
 * get dynamodb items with a specified level of parallelism
 * @param {Object[]} Keys keys to get
 * @param {string} TableName table to get from
 * @param {int} parallelism number of concurrent requests to execute at once
 */
export function DynamoDB_ParallelGet<T = unknown>(
  Keys: DynamoDB.DocumentClient.Key[],
  { parallelism = 5, ...options }: IParallelGetParams
): Promise<T[]> {
  const gets = Keys.map((Key) => ({
    Key,
    ...options,
  }));
  return eachLimit(gets, (params: DynamoDBGetParams) => DynamoDB_Get<T>(params), parallelism);
}

/**
 * Get a single item attribute, throw exception if item doesn't exist
 * @param {string} table
 * @param lookupKey
 * @returns {Promise<DynamoDB.DocumentClient.AttributeMap>}
 */
export async function DynamoDB_Get<T = unknown>(params: DynamoDBGetParams): Promise<T> {
  const result = await dynamodb.doc.get(params).promise();

  if (!result.Item || result?.$response?.error) {
    logger.error(`Error happened during run "dynamodb.doc.get"`);
    logger.error(`params: ${JSON.stringify(params)}`);
    logger.error(JSON.stringify(result));
    throw new ItemNotFoundError(`item not found for key: ${params.Key}`);
  }

  return result.Item as T;
}

/**
 * Get a single item attribute, throw exception if item of att don't exist
 * @param {string} TableName
 * @param {DynamoDB.DocumentClient.Key} Key
 * @param {string} attr
 * @returns {any} attribute value
 */
export async function DynamoDB_GetAttr<T = unknown>(
  TableName: string,
  Key: DynamoDB.DocumentClient.Key,
  attr: string
): Promise<T> {
  const result = await dynamodb.doc
    .get({
      TableName,
      Key,
    })
    .promise();

  if (!result.Item || result?.$response?.error) {
    logger.error(`params: ${JSON.stringify({ TableName, Key })}`);
    logger.error(`resut: ${JSON.stringify(result)}`);
    throw new ItemNotFoundError(`item not found for key: ${Key}`);
  }

  if (!(attr in result.Item)) {
    throw new AttrNotFoundError(`attribute ${attr} not found for item with key ${Key}`);
  }

  return result.Item[attr];
}

interface IParallelUpdate extends Omit<DynamoDB.DocumentClient.UpdateItemInput, 'Key'> {
  parallelism?: number;
}

/**
 * get dynamodb items with a specified level of parallelism
 * @param {Object[]} keys keys to update
 * @param TableName
 * @param AttributeUpdates
 * @param Expected
 * @param ReturnConsumedCapacity
 * @param ReturnItemCollectionMetrics
 * @param {string} UpdateExpression  expression like 'set #a = :x + :y'
 * @param {string} ConditionExpression condition that must be true for update to succeed
 * @param {Object} ExpressionAttributeNames map from names to field names ({"#x": "X"})
 * @param {Object} ExpressionAttributeValues map from names to values ({":x": 42})
 * @param {string} ReturnValues "NONE", "ALL_OLD", "ALL_NEW", etc...: what to return:
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#update-property
 * @param {int} parallelism number of concurrent requests to execute at once
 */
export function DynamoDB_ParallelUpdate(
  keys: DynamoDB.DocumentClient.Key[],
  { parallelism = 5, ...options }: IParallelUpdate
): Promise<PromiseResult<DynamoDB.DocumentClient.UpdateItemOutput, AWSError>[]> {
  const updates: DynamoDB.DocumentClient.UpdateItemInput[] = keys.map((k) => ({
    Key: k,
    ...options,
  }));
  return eachLimit(
    updates,
    (updateInput: DynamoDB.DocumentClient.UpdateItemInput) => DynamoDB_Update(updateInput),
    parallelism
  );
}

/**
 *  Update Item at table
 * @param TableName
 * @param Key
 * @param AttributeUpdates
 * @param Expected
 * @param ConditionalOperator
 * @param ReturnConsumedCapacity
 * @param ReturnItemCollectionMetrics
 * @param UpdateExpression
 * @param ConditionExpression
 * @param ExpressionAttributeNames
 * @param ExpressionAttributeValues
 * @param {string} ReturnValues "NONE", "ALL_OLD", "ALL_NEW", etc...: what to return:
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#update-property
 */
export async function DynamoDB_Update(
  params: DynamoDB.DocumentClient.UpdateItemInput
): Promise<PromiseResult<DynamoDB.DocumentClient.UpdateItemOutput, AWSError>> {
  const result = await dynamodb.doc.update(params).promise();

  if (result?.$response?.error) {
    logger.error(`Error happened during run "dynamodb.doc.update"`);
    logger.error(`params: ${JSON.stringify(params)}`);
    logger.error(`resut: ${JSON.stringify(result)}`);
    throw new Error(`Could not query DynamoDB: ${JSON.stringify(params)}`);
  }

  return result;
}

export interface IQueryResult<T> extends Omit<DynamoDB.DocumentClient.QueryOutput, 'Item'> {
  Items: T[];
}

/**
 * A convenience wrapper around DynamoDB query exposing the more common options
 * @param TableName
 * @param IndexName
 * @param Select
 * @param AttributesToGet
 * @param Limit
 * @param ConsistentRead
 * @param KeyConditions
 * @param QueryFilter
 * @param ConditionalOperator
 * @param ScanIndexForward
 * @param ExclusiveStartKey
 * @param ReturnConsumedCapacity
 * @param ProjectionExpression
 * @param FilterExpression
 * @param KeyConditionExpression
 * @param ExpressionAttributeNames
 * @param ExpressionAttributeValues
 * @returns query results
 */
export async function DynamoDB_Query(
  params: DynamoDB.DocumentClient.QueryInput
): Promise<PromiseResult<DynamoDB.DocumentClient.QueryOutput, AWSError>> {
  const result = await dynamodb.doc.query(params).promise();

  if (result.Items === undefined || result?.$response?.error) {
    logger.error(`Error happened during run "dynamodb.doc.query"`);
    logger.error(`params: ${JSON.stringify(params)}`);
    logger.error(`resut: ${JSON.stringify(result)}`);
    throw new Error(`Could not query DynamoDB: ${JSON.stringify(params)}`);
  }

  return result;
}

interface IBasicScan extends Omit<DynamoDB.DocumentClient.ScanInput, 'ProjectionExpression'> {
  fields?: string[];
}

/**
 * A convenience wrapper around DynamoDB scan exposing the more common options
 * @param params params
 * @param params.fields string array of field which should be returned
 * @param TableName
 * @param IndexName
 * @param AttributesToGet
 * @param Limit
 * @param Select
 * @param ScanFilter
 * @param ConditionalOperator
 * @param ExclusiveStartKey
 * @param ReturnConsumedCapacity
 * @param TotalSegments
 * @param Segment
 * @param ProjectionExpression
 * @param FilterExpression
 * @param ExpressionAttributeNames
 * @param ExpressionAttributeValues
 * @param ConsistentRead
 * @returns scan results
 */
export async function DynamoDB_Scan({
  fields,
  ...options
}: IBasicScan): Promise<PromiseResult<DynamoDB.DocumentClient.ScanOutput, AWSError>> {
  const ProjectionExpression = fields ? fields.join(', ') : undefined;
  const params = {
    ...options,
    ProjectionExpression,
  };
  const result = await dynamodb.doc.scan(params).promise();

  if (result.Items === undefined || result?.$response?.error) {
    logger.error(`Error happened during run "dynamodb.doc.scan"`);
    logger.error(`params: ${JSON.stringify(params)}`);
    logger.error(`resut: ${JSON.stringify(result)}`);
    throw new Error(`Could not scan DynamoDB: ${JSON.stringify(params)}`);
  }

  return result;
}

/**
 * Create a backup of a DynamoDB table
 * @param tableName table to backup
 * @param backupName name of backup to create
 * @returns details about the backup
 */
export async function DynamoDB_CreateTableBackup({
  tableName,
  backupName,
}: {
  tableName: string;
  backupName: string;
}): Promise<DynamoDB.DocumentClient.BackupDetails> {
  const result = await dynamodb.db
    .createBackup({
      TableName: tableName,
      BackupName: backupName,
    })
    .promise();

  if (!result.BackupDetails || result?.$response?.error) {
    logger.error(`Error happened during run "dynamodb.db.createBackup"`);
    logger.error(`creatBackup failed for table ${tableName} / ${backupName}`);
    logger.error(`resut: ${JSON.stringify(result)}`);
    throw Error(`creatBackup failed for table ${tableName} / ${backupName}`);
  }

  return result.BackupDetails;
}

/**
 * delete a Dynamodb table backup
 * @param backupArn ARN of backup to delete
 */
export async function DynamoDB_DeleteTableBackup(
  backupArn: string
): Promise<PromiseResult<DynamoDB.DeleteBackupOutput, AWSError>> {
  const result = await dynamodb.db
    .deleteBackup({
      BackupArn: backupArn,
    })
    .promise();

  if (result?.$response?.error) {
    logger.error(`Error happened during run "dynamodb.db.deleteBackup"`);
    logger.error(`BackupArn: ${backupArn}`);
    logger.error(`resut: ${JSON.stringify(result)}`);
    throw Error(`BackupArn: ${backupArn}`);
  }

  return result;
}

/**
 * list all backups of a DynamoDB table
 * @param tableName table to get backups for
 * @returns list of backups for a table
 */
export async function DynamoDB_ListTableBackups(
  tableName: string
): Promise<DynamoDB.DocumentClient.BackupSummaries> {
  const result = await dynamodb.db
    .listBackups({
      TableName: tableName,
    })
    .promise();

  if (!result.BackupSummaries || result?.$response?.error) {
    logger.error(`Error happened during run "dynamodb.db.listBackups"`);
    logger.error(`listBackups failed for table ${tableName}`);
    logger.error(`resut: ${JSON.stringify(result)}`);
    throw Error(`listBackups failed for table ${tableName}`);
  }

  return result.BackupSummaries;
}

function notEmpty(v: unknown): boolean {
  if (typeof v === 'number') {
    return !isNaN(v);
  }
  return v !== undefined && v !== '' && v !== null;
}

/**
 * Clean row for sending to DynamoDB: keys with empty values are removed
 * @param obj row object to clean
 * @returns {object} object with no empty values with its keys
 */
export function DynamoDB_CleanObj(obj: Record<string, unknown>): Record<string, unknown> {
  // remove empty values
  const cleanRow = mapValues(obj, (value) => {
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      return DynamoDB_CleanObj(value as Record<string, unknown>);
    }
    return value;
  });
  const res = pickBy(cleanRow, (v) => notEmpty(v));
  return res;
}

/**
 * DynamoDB can't handle keys with empty values. Clean those out
 * @param {Array} rows rows to clean
 */
export function DynamoDB_cleanRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map(DynamoDB_CleanObj);
}
