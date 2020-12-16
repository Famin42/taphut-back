import { TABLES } from 'utils/consts';
import logger, { setDebugLevel } from 'utils/logger';
import {
  DynamoDB_Query,
  DynamoDB_Get,
  DynamoDB_Put,
  DynamoDB_Delete,
  DynamoDB_Update,
  ItemNotFoundError,
  IQueryOutput,
} from 'utils/dynamodb';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

const FILTERS_MAX_COUNT = 5;

export type Currency = 'USD' | 'BYN' | 'EUR';

export interface IFIlter {
  filterName: string;
  city?: string;
  currency?: Currency;
  minPrice?: number;
  maxPrice?: number;
  roomsNumber?: number;
}

export interface IFIlterRaw {
  chatId: string;
  filterName: string;
  createdAt: string;
  updatedAt: string;
  filter: IFIlter;
}

export async function getFilters(chatId: string): Promise<IQueryOutput<IFIlterRaw>> {
  logger.info(`getFiltersByChatId`);
  logger.info(`chatId: ${JSON.stringify(chatId)}`);

  return await DynamoDB_Query<IFIlterRaw>({
    TableName: TABLES.TelegramUserFilters,
    KeyConditionExpression: 'chatId = :chatId',
    ExpressionAttributeValues: { ':chatId': chatId },
  });
}

export async function getFilterById(chatId: string, filterName: string): Promise<IFIlterRaw> {
  logger.info(`getFilterById`);
  logger.info(`chatId: ${chatId},`);
  logger.info(`filterName: ${JSON.stringify(filterName)}`);

  try {
    return await DynamoDB_Get<IFIlterRaw>({
      TableName: TABLES.TelegramUserFilters,
      Key: { chatId, filterName },
    });
  } catch (error) {
    if (!(error instanceof ItemNotFoundError)) {
      logger.error(error.message);
    }
    throw error;
  }
}

export async function createFilter(chatId: string, filter: IFIlter): Promise<IFIlter> {
  logger.info(`createFilter`);
  logger.info(`chatId: ${chatId}`);
  logger.info(`filter: ${JSON.stringify(filter)}`);

  const { Count } = await getFilters(chatId);

  if (typeof Count === 'number' && Count >= FILTERS_MAX_COUNT) {
    throw new Error('Maximum number of filters has been reached');
  }

  const { filterName } = filter;
  const createdAt = new Date().toISOString();
  const Item: IFIlterRaw = {
    chatId,
    filterName,
    filter,
    createdAt,
    updatedAt: createdAt,
  };

  try {
    await DynamoDB_Put({
      TableName: TABLES.TelegramUserFilters,
      Item,
      ConditionExpression: 'filterName <> :filtername',
      ExpressionAttributeValues: {
        ':filtername': filterName,
      },
    });
  } catch (error) {
    if (error.toString().indexOf('conditional') > -1) {
      throw new Error(`"${filter.filterName}" name is already used`);
    } else {
      logger.error(error.message);
      throw error;
    }
  }

  return filter;
}

export async function updateFilterById(
  chatId: string,
  updatedFilter: IFIlter
): Promise<IFIlterRaw> {
  logger.info(`updateFilterById`);
  logger.info(`chatId: ${chatId}`);
  logger.info(`updatedFilter: ${JSON.stringify(updatedFilter)}`);

  const { filterName } = updatedFilter;

  try {
    const { Attributes } = await DynamoDB_Update({
      TableName: TABLES.TelegramUserFilters,
      Key: { chatId, filterName },
      UpdateExpression: `set updatedAt = :updatedAt, #fl = :updatedFl`,
      ConditionExpression: 'filterName = :filtername',
      ExpressionAttributeNames: {
        '#fl': 'filter',
      },
      ExpressionAttributeValues: {
        ':filtername': filterName,
        ':updatedFl': updatedFilter,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    return Attributes as IFIlterRaw;
  } catch (error) {
    if (error.toString().indexOf('conditional') > -1) {
      throw new ItemNotFoundError(`item not found for key: ${filterName}`);
    } else {
      logger.error(error.message);
      throw error;
    }
  }
}

export async function deleteFilterById(chatId: string, filterName: string): Promise<IFIlterRaw> {
  logger.info(`deleteFilterById`);
  logger.info(`chatId: ${chatId}`);
  logger.info(`filterName: ${filterName}`);

  try {
    const { Attributes } = await DynamoDB_Delete({
      TableName: TABLES.TelegramUserFilters,
      Key: { chatId, filterName },
      ReturnValues: 'ALL_OLD',
    });

    if (!Attributes) {
      throw new ItemNotFoundError(`item not found for key: ${filterName}`);
    }

    return Attributes as IFIlterRaw;
  } catch (error) {
    if (!(error instanceof ItemNotFoundError)) {
      logger.error(error.message);
    }

    throw error;
  }
}
