/* eslint-disable @typescript-eslint/no-unused-vars */
import { convertToNewOnlinerApartmentRowItem } from 'onliner-crawler/onliner-helper';
import { APARTMENTS_STORING_DURATION_IN_WEEKS, TABLES } from 'utils/consts';
import { getUnixTimeInSeconds, increaseDate } from 'utils/date';
import { IOnlinerApartmentRow } from 'onliner-crawler/model';
import { BatchWriteItem, DynamoDB_Whole_Scan } from 'utils/dynamodb';
import logger, { setDebugLevel } from 'utils/logger';
import { DynamoDB } from 'aws-sdk';

setDebugLevel('debug');

async function main(): Promise<any> {
  const apartments = await getAllApartments();

  console.log('Apartment OLD:');
  console.log(JSON.stringify(apartments[0], null, 2));

  const validatedApartments = apartments.map(
    ({ apartment, status, createdAt, ...oldItem }: IOnlinerApartmentRow) => {
      const expirationTime = getUnixTimeInSeconds(
        increaseDate(APARTMENTS_STORING_DURATION_IN_WEEKS, 'week', new Date(apartment.created_at))
      );

      const item = convertToNewOnlinerApartmentRowItem(apartment, status);
      item.expirationTime = expirationTime;

      return {
        ...oldItem,
        ...item,
        createdAt,
        updatedAt: new Date().toISOString(),
      };
    }
  );

  console.log('\n ---------------------------');
  console.log('Apartment NEW:');
  console.log(JSON.stringify(validatedApartments[0], null, 2));

  console.log('\n ---------------------------');
  console.log(`Start BatchWriteItem to "${TABLES.OnlinerApartment}"`);
  console.log(`Length: "${validatedApartments.length}"`);

  const batch: DynamoDB.DocumentClient.WriteRequest[][] = chunkArray(
    validatedApartments.map((Item: IOnlinerApartmentRow) => ({
      PutRequest: {
        Item,
      },
    }))
  );

  try {
    for (let index = 0; index < batch.length; index++) {
      const WriteRequests = batch[index];

      // Max Batch size is 25
      const params: DynamoDB.DocumentClient.BatchWriteItemInput = {
        RequestItems: {
          [TABLES.OnlinerApartment]: WriteRequests,
        },
      };

      await BatchWriteItem(params);
    }
    logger.info(`COMPLETE BatchWriteItem, length: ${validatedApartments.length}`);
  } catch (error) {
    logger.error(error.message);
  }
}

async function getAllApartments(): Promise<IOnlinerApartmentRow[]> {
  try {
    const result = await DynamoDB_Whole_Scan<IOnlinerApartmentRow>({
      TableName: TABLES.OnlinerApartment,
    });

    return result;
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
}

function chunkArray(myArray: any[], chunk_size = 25): any[][] {
  const arrayLength = myArray.length;
  const tempArray = [];

  for (let index = 0; index < arrayLength; index += chunk_size) {
    const myChunk: any = myArray.slice(index, index + chunk_size);
    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
}

main();
