import { IFIlter } from 'utils/filter';

export function filterToString(filter: IFIlter, msg = ''): string {
  msg = msg.concat(`filter:          ${filter.filterName}\n`);

  if (filter.currency) {
    msg = msg.concat(`currency:        ${filter.currency}\n`);
  }
  if (typeof filter.minPrice === 'number') {
    msg = msg.concat(`min price:       ${filter.minPrice}\n`);
  }
  if (typeof filter.maxPrice === 'number') {
    msg = msg.concat(`max price:       ${filter.maxPrice}\n`);
  }
  if (typeof filter.roomsNumber === 'number') {
    msg = msg.concat(`number of rooms: ${filter.roomsNumber}\n`);
  }
  if (filter.city) {
    msg = msg.concat(`city:            ${filter.city}\n`);
  }
  return msg;
}

export function filtersToString(filters: IFIlter[], msg = ''): string {
  msg = msg.concat(`number of filters:   ${filters.length}\n`);

  filters.forEach((filter: IFIlter, index: number) => {
    msg = msg.concat(`${index + 1}. ${filter.filterName}\n`);
  });

  return msg;
}
