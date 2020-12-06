import logger, { setDebugLevel } from 'utils/logger';
import { MOCK_FILTERS } from './mock/filter.mock';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

const FILTERS_MAX_COUNT = 10;

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
  updateAt: string;
  filter: IFIlter;
}

export async function getFilters(chatId: string): Promise<IFIlter[]> {
  logger.info(`getFiltersByChatId`);
  logger.info(`chatId: ${JSON.stringify(chatId)}`);

  return MOCK_FILTERS;
}

export async function getFilterById(
  chatId: string,
  filterName: string
): Promise<IFIlter | undefined> {
  logger.info(`getFilterById`);
  logger.info(`chatId: ${chatId},`);
  logger.info(`filterName: ${JSON.stringify(filterName)}`);

  const filter: IFIlter | undefined = MOCK_FILTERS.find(
    (f: IFIlter) => f.filterName === filterName
  );

  return filter;
}

export async function createFilter(chatId: string, filter: IFIlter): Promise<IFIlter> {
  logger.info(`createFilter`);
  logger.info(`chatId: ${chatId}`);
  logger.info(`filter: ${JSON.stringify(filter)}`);

  const userFilters = await getFilters(chatId);

  if (userFilters.length >= FILTERS_MAX_COUNT) {
    throw new Error('Maximum number of filters has been reached');
  }

  const isNameAlreadyUsed = !!userFilters.filter((f: IFIlter) => f.filterName === filter.filterName)
    .length;

  if (isNameAlreadyUsed) {
    throw new Error(`"${filter.filterName}" name is already used`);
  }

  return filter;
}

export async function updateFilterById(
  chatId: string,
  filterName: string,
  newFilter: Omit<IFIlter, 'filterName'>
): Promise<IFIlter> {
  logger.info(`updateFilterById`);
  logger.info(`chatId: ${chatId}`);
  logger.info(`filterName: ${filterName}`);
  logger.info(`newFilter: ${JSON.stringify(newFilter)}`);

  const currentFilter = await getFilterById(chatId, filterName);

  if (!currentFilter) {
    throw new Error(`"${filterName}" filter doesn't exist!`);
  }

  const updatedFilter: IFIlter = {
    ...currentFilter,
    ...(newFilter as IFIlter),
  };

  return updatedFilter;
}

export async function deleteFilterById(chatId: string, filterName: string): Promise<IFIlter> {
  logger.info(`deleteFilterById`);
  logger.info(`chatId: ${chatId}`);
  logger.info(`filterName: ${filterName}`);

  const currentFilter = await getFilterById(chatId, filterName);

  if (!currentFilter) {
    throw new Error(`"${filterName}" filter doesn't exist!`);
  }

  return currentFilter;
}
