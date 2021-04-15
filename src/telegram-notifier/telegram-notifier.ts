import { APIGatewayProxyHandler, APIGatewayEvent, Callback, Context } from 'aws-lambda';

import { IOnlinerApartment, IOnlinerApartmentRow } from 'onliner-crawler/model';
import { onlinerApartmentToString } from 'utils/converters/apartment';
import logger, { setDebugLevel } from 'utils/logger';
import { eachLimit, retryNTimes } from 'utils/async';
import { IFilter, IFilterRow } from 'utils/filter';
import { sendToUser } from 'utils/telegram';
import { mustEnv } from 'utils/env';
import {
  apartmentIsSuitedForFilter,
  getAllFilters,
  getAllNewApartments,
  updateApartmentsToOLD,
} from './telegram-notifier-helper';

setDebugLevel(process.env.DEBUG_LEVEL || 'info');

const TG_BOT_TOKEN = 'TG_BOT_TOKEN';

type Notification = { chat_id: string; apartment: IOnlinerApartment };

/**
 *  1. Scan All of NEW Apartments
 *  2. Scan All Filters
 *  3. For Apartments check filter
 *    3.1 Algorithm for form notification:
 *      - form filterMapObj { [key: chatId]: arrayOfChatFilters[] }
 *      - iterate through all points
 *        - iterate through chatIds in filterMapObj
 *          - iterate through all filters in chatIds
 *            - if apartment suite for filter, push { chatId, apartment } to notification and go to next chatId
 *  4. Parallel process notifications and execute sendToUser(filter.chatID, convertApartmentToMsg(apartment))
 *  5. Update NEW Apartment to OLD Apartments
 */
export const handler: APIGatewayProxyHandler = async (
  _event: APIGatewayEvent,
  _context: Context,
  callback: Callback
): Promise<any> => {
  logger.info(`Telegram-notifier start`);
  const token: string = mustEnv(TG_BOT_TOKEN);
  const newApartments = await getAllNewApartments();
  logger.info(`newApartments count: ${newApartments.length}`);

  const filters = await getAllFilters();
  logger.info(`filters count: ${filters.length}`);

  const notifications: Notification[] = [];
  const filtersByChatId: { [chatId: string]: IFilter[] } = {};

  filters.forEach(({ chatId, filter }: IFilterRow) => {
    if (Array.isArray(filtersByChatId[chatId])) {
      filtersByChatId[chatId].push(filter);
    } else {
      filtersByChatId[chatId] = [filter];
    }
  });

  newApartments.forEach(({ apartment }: IOnlinerApartmentRow) => {
    Object.keys(filtersByChatId).forEach((chat_id: string) => {
      const chatFilters: IFilter[] = filtersByChatId[chat_id];

      chatFilters.some((filter: IFilter) => {
        if (apartmentIsSuitedForFilter(apartment, filter)) {
          notifications.push({ chat_id, apartment });

          logger.info(
            `Apartment ${apartment.id} is suited for filter: (${chat_id} ${filter.filterName})`
          );
          logger.info(`Skip checking current chatId filters, go to next chatId filters`);
          return true;
        }

        return false;
      });
    });
  });

  logger.info(`Total notifications count: ${notifications.length}`);

  if (notifications.length) {
    await eachLimit(
      notifications,
      async ({ chat_id, apartment }: Notification) =>
        await retryNTimes({
          func: async () =>
            await sendToUser({ token, chat_id, text: onlinerApartmentToString(apartment) }),
          timeOut: 10000,
          maxTries: 1,
        }),
      10,
      10000
    );

    logger.info(`Notifications are send`);
  }

  await updateApartmentsToOLD(newApartments);

  logger.info(`Apartments status is updated to OLD`);
  logger.info(`Telegram-notifier complete`);
  callback(null, 'success');
};
