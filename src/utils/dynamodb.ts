import { mapValues, pickBy } from 'lodash';
import { AWSError, DynamoDB } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';

import { newErrorType } from 'utils/errors';
import { eachLimit } from 'utils/async';

function isOffline() {
  return !!process.env.DYNAMODB_ENDPOINT;
}

const options = isOffline()
  ? {
      region: 'localhost',
      endpoint: process.env.DYNAMODB_ENDPOINT,
      apiVersion: '2012-08-10',
    }
  : { apiVersion: '2012-08-10' };

export const dynamodb = {
  doc: new DynamoDB.DocumentClient(options),
  db: new DynamoDB(options),
};

/**
 * Helper to convert a list of items to a list of dynamodb put operations
 * @param {string} tableName table to generate puts for
 * @param {Array} items items to put into table
 * @param {string} conditionExpression condition that must be true for write to go through
 * @returns {Array} array of put operations that can be passed to dynamodb
 */
export function itemsToDynamoPuts<T>(
  tableName: string,
  items: T[],
  conditionExpression?: string
): DynamoDB.DocumentClient.PutItemInput[] {
  return items.map(
    (item): DynamoDB.DocumentClient.PutItemInput => ({
      TableName: tableName,
      Item: item,
      ConditionExpression: conditionExpression,
    })
  );
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
export function parallelPut<T>(
  dbd: DynamoDB.DocumentClient,
  items: T[],
  table: string,
  parallelism = 5,
  conditionExpression?: string
): Promise<PromiseResult<DynamoDB.DocumentClient.PutItemOutput, AWSError>[]> {
  const putRequests = itemsToDynamoPuts(table, items, conditionExpression);
  return eachLimit(
    putRequests,
    (item: DynamoDB.DocumentClient.PutItemInput) => dbd.put(item).promise(),
    parallelism
  );
}

/**
 * delete dynamodb items with a specified level of parallelism
 * @param {DynamoDB.DocumentClient} dbd dynamodb client
 * @param {Object[]} keys keys to delete
 * @param {string} table table to delete from
 * @param {int} parallelism number of concurrent requests to execute at once
 */
export function parallelDelete(
  dbd: DynamoDB.DocumentClient,
  keys: DynamoDB.DocumentClient.Key[],
  table: string,
  parallelism = 5
): Promise<PromiseResult<DynamoDB.DocumentClient.DeleteItemOutput, AWSError>[]> {
  const deletes = keys.map((k) => ({
    TableName: table,
    Key: k,
  }));
  return eachLimit(
    deletes,
    (d: DynamoDB.DocumentClient.DeleteItemInput) => dbd.delete(d).promise(),
    parallelism
  );
}

export const ItemNotFoundError = newErrorType('ItemNotFoundError');
export const AttrNotFoundError = newErrorType('AttrNotFoundError');

/**
 * Get a single item attribute, throw exception if item doesn't exist
 * @param {string} table
 * @param lookupKey
 * @returns {Promise<DynamoDB.DocumentClient.AttributeMap>}
 */
export async function get(
  table: string,
  lookupKey: DynamoDB.DocumentClient.Key
): Promise<DynamoDB.DocumentClient.AttributeMap> {
  const getResult = await dynamodb.doc
    .get({
      TableName: table,
      Key: lookupKey,
    })
    .promise();

  if (!getResult.Item) {
    throw new ItemNotFoundError(`item not found for key: ${lookupKey}`);
  }

  return getResult.Item;
}

interface IParallelGet {
  table: string;
  keys: DynamoDB.DocumentClient.Key[];
  parallelism?: number;
}

/**
 * get dynamodb items with a specified level of parallelism
 * @param {Object[]} keys keys to get
 * @param {string} table table to get from
 * @param {int} parallelism number of concurrent requests to execute at once
 */
export function parallelGet({
  table,
  keys,
  parallelism = 5,
}: IParallelGet): Promise<PromiseResult<DynamoDB.DocumentClient.GetItemOutput, AWSError>[]> {
  const gets = keys.map((k) => ({
    TableName: table,
    Key: k,
  }));
  return eachLimit(
    gets,
    (getInput: DynamoDB.DocumentClient.GetItemInput) => dynamodb.doc.get(getInput).promise(),
    parallelism
  );
}

interface IParallelUpdate {
  table: string;
  keys: DynamoDB.DocumentClient.Key[];
  updateExpression: string;
  expressionAttributeNames: {
    [key: string]: DynamoDB.DocumentClient.AttributeName;
  };
  expressionAttributeValues: {
    [key: string]: DynamoDB.DocumentClient.AttributeValue;
  };
  conditionExpression?: string;
  returnValues?: string;
  parallelism?: number;
}

/**
 * get dynamodb items with a specified level of parallelism
 * @param {string} table table to update
 * @param {Object[]} keys keys to update
 * @param {string} updateExpression expression like 'set #a = :x + :y'
 * @param {Object} expressionAttributeNames map from names to field names ({"#x": "X"})
 * @param {Object} expressionAttributeValues map from names to values ({":x": 42})
 * @param {string} conditionExpression condition that must be true for update to succeed
 * @param {string} returnValues "NONE", "ALL_OLD", "ALL_NEW", etc...: what to return:
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#update-property
 * @param {int} parallelism number of concurrent requests to execute at once
 */
export function parallelUpdate({
  table,
  keys,
  updateExpression,
  expressionAttributeNames,
  expressionAttributeValues,
  conditionExpression,
  returnValues,
  parallelism = 5,
}: IParallelUpdate): Promise<PromiseResult<DynamoDB.DocumentClient.UpdateItemOutput, AWSError>[]> {
  const updates: DynamoDB.DocumentClient.UpdateItemInput[] = keys.map((k) => ({
    TableName: table,
    Key: k,
    UpdateExpression: updateExpression,
    ConditionExpression: conditionExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: returnValues,
  }));
  return eachLimit(
    updates,
    (updateInput: DynamoDB.DocumentClient.GetItemInput) =>
      dynamodb.doc.update(updateInput).promise(),
    parallelism
  );
}

/**
 * Get a single item attribute, throw exception if item of att don't exist
 * @param {string} table
 * @param {DynamoDB.DocumentClient.Key} lookupKey
 * @param {string} attr
 * @returns {any} attribute value
 */
export async function getAttr<T = unknown>(
  table: string,
  lookupKey: DynamoDB.DocumentClient.Key,
  attr: string
): Promise<T> {
  const getResult = await dynamodb.doc
    .get({
      TableName: table,
      Key: lookupKey,
    })
    .promise();

  if (!getResult.Item) {
    throw new ItemNotFoundError(`item not found for key: ${lookupKey}`);
  }

  if (!(attr in getResult.Item)) {
    throw new AttrNotFoundError(`attribute ${attr} not found for item with key ${lookupKey}`);
  }

  return getResult.Item[attr];
}

interface IBasicQuery {
  table: string;
  index?: string;
  keyExpression: string;
  expressionAttributeValues: { [key: string]: any };
  expressionAttributeNames?: { [key: string]: any };
  limit?: number;
}

export interface IQueryResults {
  items: DynamoDB.DocumentClient.AttributeMap[];
  lastEvaluatedKey: DynamoDB.DocumentClient.Key | undefined;
}

/**
 * A convenience wrapper around DynamoDB query exposing the more common options
 * @param params params
 * @param params.table table to query
 * @param params.keyExpression query using this key expression
 * @param params.expressionAttributeValues values of attributes used in keyExpression
 * @returns query results
 */
export async function query({
  table,
  index,
  keyExpression,
  expressionAttributeValues,
  expressionAttributeNames,
  limit,
}: IBasicQuery): Promise<IQueryResults> {
  const queryParams = {
    TableName: table,
    IndexName: index,
    KeyConditionExpression: keyExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    Limit: limit,
  };
  const result = await dynamodb.doc.query(queryParams).promise();
  if (result.Items === undefined) {
    throw new Error(`Could not query DynamoDB: ${JSON.stringify(queryParams)}`);
  }
  return {
    items: result.Items,
    lastEvaluatedKey: result.LastEvaluatedKey,
  };
}

interface IBasicScan {
  table: string;
  fields?: string[];
  filterExpression?: string;
  expressionAttributeNames?: { [key: string]: string };
  expressionAttributeValues?: { [key: string]: any };
  exclusiveStartKey?: DynamoDB.DocumentClient.Key;
  consistentRead?: boolean;
}

export interface IScanResults {
  items: DynamoDB.DocumentClient.AttributeMap[];
  lastEvaluatedKey: DynamoDB.DocumentClient.Key | undefined;
}

/**
 * A convenience wrapper around DynamoDB scan exposing the more common options
 * @param params params
 * @param params.table table to scan
 * @param params.fields return only these fields
 * @param params.filterExpression filter rows with this expression
 * @param params.expressionAttributeNames names of attributes used in filterExpression
 * @param params.expressionAttributeValues values of attributes used in filterExpression
 * @param params.exclusiveStartKey start scanning from this key
 * @returns scan results
 */
export async function scan({
  table,
  fields,
  filterExpression,
  expressionAttributeNames,
  expressionAttributeValues,
  exclusiveStartKey,
  consistentRead,
}: IBasicScan): Promise<IScanResults> {
  const ProjectionExpression = fields ? fields.join(', ') : undefined;
  const scanParams = {
    TableName: table,
    ProjectionExpression,
    FilterExpression: filterExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ExclusiveStartKey: exclusiveStartKey,
    ConsistentRead: consistentRead,
  };
  const result = await dynamodb.doc.scan(scanParams).promise();
  if (result.Items === undefined) {
    throw new Error(`Could not scan DynamoDB: ${JSON.stringify(scanParams)}`);
  }
  return {
    items: result.Items,
    lastEvaluatedKey: result.LastEvaluatedKey,
  };
}

interface IPutArgs {
  table: string;
  item: any;
  conditionExpression?: string;
}

/**
 * A convenience wrapper around DynamoDB put
 * Put a single item into table
 * @param table
 * @param item
 * @param conditionExpression
 */
export function put({
  table,
  item,
  conditionExpression,
}: IPutArgs): Promise<PromiseResult<DynamoDB.DocumentClient.PutItemOutput, AWSError>> {
  return dynamodb.doc
    .put({
      TableName: table,
      Item: item,
      ConditionExpression: conditionExpression,
    })
    .promise();
}

interface IDelArgs {
  table: string;
  key: any;
  conditionExpression?: string;
}

/**
 * A convenience wrapper around DynamoDB delete
 * Delete a single key from table
 * @param table
 * @param key
 * @param conditionExpression
 */
export function del({
  table,
  key,
  conditionExpression,
}: IDelArgs): Promise<PromiseResult<DynamoDB.DocumentClient.DeleteItemOutput, AWSError>> {
  return dynamodb.doc
    .delete({
      TableName: table,
      Key: key,
      ConditionExpression: conditionExpression,
    })
    .promise();
}

/**
 * Create a backup of a DynamoDB table
 * @param tableName table to backup
 * @param backupName name of backup to create
 * @returns details about the backup
 */
export async function createTableBackup({
  tableName,
  backupName,
}: {
  tableName: string;
  backupName: string;
}): Promise<DynamoDB.DocumentClient.BackupDetails> {
  const res = await dynamodb.db
    .createBackup({
      TableName: tableName,
      BackupName: backupName,
    })
    .promise();
  if (!res.BackupDetails) {
    throw Error(`creatBackup failed for table ${tableName} / ${backupName}`);
  }
  return res.BackupDetails;
}

/**
 * delete a Dynamodb table backup
 * @param backupArn ARN of backup to delete
 */
export function deleteTableBackup(
  backupArn: string
): Promise<PromiseResult<DynamoDB.DeleteBackupOutput, AWSError>> {
  return dynamodb.db
    .deleteBackup({
      BackupArn: backupArn,
    })
    .promise();
}

/**
 * list all backups of a DynamoDB table
 * @param tableName table to get backups for
 * @returns list of backups for a table
 */
export async function listTableBackups(
  tableName: string
): Promise<DynamoDB.DocumentClient.BackupSummaries> {
  const backups = await dynamodb.db
    .listBackups({
      TableName: tableName,
    })
    .promise();
  if (!backups.BackupSummaries) {
    throw Error(`listBackups failed for table ${tableName}`);
  }
  return backups.BackupSummaries;
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
export function cleanObj(obj: Record<string, unknown>): Record<string, unknown> {
  // remove empty values
  const cleanRow = mapValues(obj, (value) => {
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      return cleanObj(value as Record<string, unknown>);
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
export function cleanRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map(cleanObj);
}
