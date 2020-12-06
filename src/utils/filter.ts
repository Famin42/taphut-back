import logger, { setDebugLevel } from 'utils/logger';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

const FILTERS_MAX_COUNT = 10;

export interface IFIlter {
  id: string;
  chatId: string;
  someField: string;
}

export async function getFilters(chatId: string): Promise<IFIlter[]> {
  logger.info(`getFiltersByChatId`);
  logger.info(`chatId: ${JSON.stringify(chatId)}`);
  return [];
}

export async function getFilterById(
  chatId: string,
  filterId: string
): Promise<IFIlter | undefined> {
  logger.info(`getFilterById`);
  logger.info(`chatId: ${chatId},`);
  logger.info(`filterId: ${JSON.stringify(filterId)}`);
  return undefined;
}

export async function createFilter(
  chatId: string,
  filter: Omit<IFIlter, 'id' | 'chatId'>
): Promise<IFIlter | undefined> {
  const userFilters = await getFilters(chatId);

  if (userFilters.length >= FILTERS_MAX_COUNT) {
    throw new Error('Maximum number of filters has been reached');
  }

  logger.info(`createFilter`);
  logger.info(`chatId: ${chatId}`);
  logger.info(`filter: ${JSON.stringify(filter)}`);
  return undefined;
}

export async function updateFilterById(
  chatId: string,
  filterId: string,
  newFilter: Partial<Omit<IFIlter, 'id'>>
): Promise<IFIlter | undefined> {
  // const updatedFilter: IFIlter = {
  //   ...currentFilter,
  //   ...(newFilter as IFIlter),
  // };
  logger.info(`updateFilterById`);
  logger.info(`chatId: ${chatId}`);
  logger.info(`filterId: ${filterId}`);
  logger.info(`newFilter: ${JSON.stringify(newFilter)}`);
  return undefined;
}

export async function deleteFilterById(
  chatId: string,
  filterId: string
): Promise<IFIlter | undefined> {
  logger.info(`deleteFilterById`);
  logger.info(`chatId: ${chatId}`);
  logger.info(`filterId: ${filterId}`);
  return undefined;
}
