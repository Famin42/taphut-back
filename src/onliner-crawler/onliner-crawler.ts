import { APIGatewayProxyHandler, APIGatewayEvent, Callback, Context } from 'aws-lambda';
import fetch from 'node-fetch';
import { eachLimit } from 'utils/async';

import logger, { setDebugLevel } from 'utils/logger';
import { IOnlinerApartment, IOnlinerData, IOnlinerPagiantion } from './model';
import {
  convertToNewOnlinerApartmentRawItem,
  filterOutOnlyNewValues,
  formOnlnerURL,
  IOnlinerURLParams,
  parallelPutOnlinerApartments,
} from './onliner-helper';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

export const ONLINER_TIMEOUT = 2000;
export const ONLINER_LIMIT = 500;
export const DYNAMO_DB_SCAN_LIMIT = 500;

/**
 * 1. Get first batch of items from onliner
 * 2. Form array of URLs for parallel fetch
 * 3. Parallel fetch data from Onliner, return formed map of items
 */

export const handler: APIGatewayProxyHandler = async (
  _event: APIGatewayEvent,
  _context: Context,
  callback: Callback
): Promise<any> => {
  logger.info(`Onliner Crawler`);

  const URLs = await formURLs(ONLINER_LIMIT);

  const apartmentMap = await getApartmentMap(URLs);
  logger.info(`fetching from Onliner: length: ${apartmentMap.size}`);

  // SCAN DB and FLITER FOR STAY ONLY NEW
  const filteredApartments = await filterOutOnlyNewValues(apartmentMap);
  logger.info(`filtered appointments from Onliner: length: ${filteredApartments.length}`);

  const Items = filteredApartments.map((item: IOnlinerApartment) => {
    logger.info(`new apartment id: ${item.id}`);
    return convertToNewOnlinerApartmentRawItem(item);
  });

  await parallelPutOnlinerApartments(Items);

  logger.info(`COMPLETE SUCCESS, put items: ${Items.length}`);
  callback(null, null);
};

async function formURLs(BATCH_SIZE: number): Promise<URL[]> {
  const { limit, last, current, total } = await getOnlinerPagination({ limit: BATCH_SIZE });
  logger.debug(`LIMIT: ${limit}, COUNT: ${total}, NUMBER OF REQUESTS: ${Math.ceil(total / limit)}`);

  const URLs = [];

  for (let page = current; page <= last; page++) {
    const url = formOnlnerURL({ page, limit });
    logger.info(`PAGE: ${page}, LIMIT: ${limit}, URL: ${url}`);
    URLs.push(url);
  }
  return URLs;
}

async function getOnlinerPagination({
  page = 1,
  limit = 10,
}: Partial<IOnlinerURLParams>): Promise<IOnlinerPagiantion & { total: number }> {
  const url = formOnlnerURL({ page, limit });
  logger.info(`Formed Onliner URL: ${url}`);

  const response = await fetch(url, { timeout: ONLINER_TIMEOUT });
  const data = (await response.json()) as IOnlinerData;

  const result = { ...data.page, total: data.total };

  return result;
}

async function getApartmentMap(URLs: URL[]): Promise<Map<number, IOnlinerApartment>> {
  const dataMap = new Map<number, IOnlinerApartment>();

  await eachLimit(
    URLs,
    async (url: URL) => {
      const batchOfData = await fetchOnlinerData(url);
      logger.info(`Keys in dataMap: ${dataMap.size}`);
      logger.info(`Keys in batchOfData: ${batchOfData.size}`);
      batchOfData.forEach((batchItem: IOnlinerApartment) => dataMap.set(batchItem.id, batchItem));
    },
    10,
    2500
  );

  return dataMap;
}

async function fetchOnlinerData(url: URL): Promise<Map<number, IOnlinerApartment>> {
  logger.info(`Fetch from url: ${url}`);

  const { apartments = [] } = (await (await fetch(url)).json()) as IOnlinerData;

  return apartments.reduce<Map<number, IOnlinerApartment>>(
    (itemsMap: Map<number, IOnlinerApartment>, item: IOnlinerApartment) => {
      return itemsMap.set(item.id, item);
    },
    new Map<number, IOnlinerApartment>()
  );
}
