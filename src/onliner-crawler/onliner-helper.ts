import { PromiseResult } from 'aws-sdk/lib/request';
import { DynamoDB, AWSError } from 'aws-sdk';
import { URL } from 'url';

import { APARTMENTS_STORING_DURATION_IN_WEEKS, ONLINER_URI } from 'utils/consts';
import { DynamoDB_ParallelPut, DynamoDB_Scan } from 'utils/dynamodb';
import { IOnlinerApartment, IOnlinerApartmentRow } from './model';
import { getUnixTimeInSeconds, increaseDate } from 'utils/date';
import { DYNAMO_DB_SCAN_LIMIT } from './onliner-crawler';
import { TABLES } from 'utils/consts';
import logger from 'utils/logger';
import { ApartmentStatus } from 'utils/models';

export interface IOnlinerURLParams {
  limit: number;
  page: number;
}

/**
 *
 * @param page default is 1
 * @param limit default is 10
 */
export function formOnlnerURL({ page = 1, limit = 10 }: Partial<IOnlinerURLParams>): URL {
  const uri = new URL(ONLINER_URI);

  uri.searchParams.append('page', page.toString());
  uri.searchParams.append('limit', limit.toString());

  return uri;
}

export async function parallelPutOnlinerApartments(Items: IOnlinerApartmentRow[]): Promise<any> {
  try {
    return await DynamoDB_ParallelPut({ Items, TableName: TABLES.OnlinerApartment });
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
}

/**
 * @param item item
 * @param status "NEW" | "IN_FLIGHT" | "ERROR" | "OLD"
 */
export function convertToNewOnlinerApartmentRowItem(
  item: IOnlinerApartment,
  status: ApartmentStatus = 'NEW'
): IOnlinerApartmentRow {
  const expirationTime = getUnixTimeInSeconds(
    increaseDate(APARTMENTS_STORING_DURATION_IN_WEEKS, 'week')
  );

  Object.keys(item.price.converted).forEach((key: string) => {
    item.price.converted[key].amount = +item.price.converted[key].amount;
  });
  item.price.amount = +item.price.amount;

  return {
    id: item.id,
    status,
    address: item.location.address.toLowerCase(),
    apartment: item,
    createdAt: new Date().toISOString(),
    expirationTime,
  };
}

export async function filterOutOnlyNewValues(
  onlinerData: Map<number, IOnlinerApartment>
): Promise<IOnlinerApartment[]> {
  let LastEvaluatedKey;
  let totalCount = 0;

  logger.info(`filterOutOnlyNewValues`);
  logger.info(`Scan: Limit = ${DYNAMO_DB_SCAN_LIMIT}`);

  do {
    const data: PromiseResult<DynamoDB.DocumentClient.ScanOutput, AWSError> = await DynamoDB_Scan({
      TableName: TABLES.OnlinerApartment,
      Limit: DYNAMO_DB_SCAN_LIMIT,
      ExclusiveStartKey: LastEvaluatedKey,
    });

    LastEvaluatedKey = data.LastEvaluatedKey;
    totalCount += data.Count || 0;

    logger.info(`LastEvaluatedKey: ${JSON.stringify(data.LastEvaluatedKey)}`);

    const onlinerAppointmetnsFromDynamo = (data.Items || []) as IOnlinerApartmentRow[];

    onlinerAppointmetnsFromDynamo.forEach((item: IOnlinerApartmentRow) => {
      if (onlinerData.has(item.id)) {
        onlinerData.delete(item.id);
      }
    });
  } while (typeof LastEvaluatedKey !== 'undefined');

  logger.info(`Total raws: ${totalCount}`);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Array.from(onlinerData, ([_name, value]) => ({
    ...value,
  }));
}
