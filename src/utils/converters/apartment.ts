import { IOnlinerApartment } from 'onliner-crawler/model';

export function onlinerApartmentToString(
  { price, url, location, rent_type }: IOnlinerApartment,
  msg = ''
): string {
  const { converted } = price;

  if (converted['USD']?.amount) {
    msg = msg.concat(`USD Price: ${converted['USD']?.amount}\n`);
  }

  if (converted['BYN']?.amount) {
    msg = msg.concat(`BYN Price: ${converted['BYN']?.amount}\n`);
  }

  msg = msg.concat(`rooms: ${rent_type.split('_')[0]}\n`);
  msg = msg.concat(`address: ${location.address}\n`);

  msg = msg.concat(`url: ${url}\n`);

  return msg;
}
