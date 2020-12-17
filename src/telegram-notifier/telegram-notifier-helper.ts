import { DynamoDB } from 'aws-sdk';
import Big from 'big.js';

import { IOnlinerApartment, IOnlinerApartmentRow } from 'onliner-crawler/model';
import { DynamoDB_ParallelUpdate, DynamoDB_Scan, DynamoDB_Whole_Scan } from 'utils/dynamodb';
import logger, { setDebugLevel } from 'utils/logger';
import { IFIlter, IFIlterRow } from 'utils/filter';
import { ApartmentStatus } from 'utils/models';
import { TABLES } from 'utils/consts';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

export async function getAllNewApartments(): Promise<IOnlinerApartmentRow[]> {
  try {
    const result = await DynamoDB_Whole_Scan<IOnlinerApartmentRow>({
      TableName: TABLES.OnlinerApartment,
      FilterExpression: '#current_status = :NEW',
      ExpressionAttributeNames: {
        '#current_status': 'status',
      },
      ExpressionAttributeValues: {
        ':NEW': 'NEW',
      },
    });

    return result;
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
}

export async function getAllFilters(): Promise<IFIlterRow[]> {
  const { Items = [] } = await DynamoDB_Scan({
    TableName: TABLES.TelegramUserFilters,
  });

  return Items as IFIlterRow[];
}

export function apartmentIsSuitedForFilter(apartment: IOnlinerApartment, filter: IFIlter): boolean {
  try {
    const city = checkCity(apartment, filter);
    const rooms = checkRooms(apartment, filter);
    const price = checkPrice(apartment, filter);

    return city && rooms && price;
  } catch (error) {
    logger.error(`Error at apartmentIsSuitedForFilter: ${error.message}`);
    return false;
  }
}

function checkCity({ location }: IOnlinerApartment, { city }: IFIlter): boolean {
  const { address } = location;
  return (
    !city ||
    (typeof address === 'string' &&
      typeof city === 'string' &&
      address.toLowerCase().includes(city.toLowerCase()))
  );
}

function checkRooms({ rent_type }: IOnlinerApartment, { roomsNumber }: IFIlter): boolean {
  if (typeof roomsNumber !== 'number' || roomsNumber === 0) {
    return true;
  }

  return typeof rent_type === 'string' && rent_type.includes(roomsNumber.toString());
}

function checkPrice(
  { price }: IOnlinerApartment,
  { currency, minPrice, maxPrice }: IFIlter
): boolean {
  const { converted } = price;

  if (currency !== 'BYN' && currency !== 'USD') {
    return false;
  }

  const { amount } = converted[currency];

  if (typeof minPrice === 'number' && Big(amount).lt(minPrice)) {
    return false;
  }

  if (typeof maxPrice === 'number' && Big(amount).gt(maxPrice)) {
    return false;
  }

  return true;
}

export async function updateApartmentsToOLD(apartments: IOnlinerApartmentRow[]): Promise<unknown> {
  const keys: DynamoDB.DocumentClient.Key[] = apartments.map((item: IOnlinerApartmentRow) => ({
    id: item.id,
  }));

  logger.info(`keys for updated to OLD: ${JSON.stringify(keys)}`);

  return await DynamoDB_ParallelUpdate(keys, {
    TableName: TABLES.OnlinerApartment,
    UpdateExpression: `set #current_status = :OLD, updatedAt = :updatedAt`,
    ConditionExpression: '#current_status = :NEW',
    ExpressionAttributeNames: {
      '#current_status': 'status',
    },
    ExpressionAttributeValues: {
      ':OLD': 'OLD' as ApartmentStatus,
      ':NEW': 'NEW' as ApartmentStatus,
      ':updatedAt': new Date().toISOString(),
    },
    parallelism: 10,
  });
}
