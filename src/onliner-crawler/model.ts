import { ApartmentStatus } from 'utils/models';

export interface IOnlinerApartmentRow {
  id: number;
  status: ApartmentStatus;
  apartment: IOnlinerApartment;
  createdAt: string;
  updatedAt?: string;
  expirationTime: number;
}

export interface IOnlinerData {
  apartments: IOnlinerApartment[];
  total: number;
  page: IOnlinerPagiantion;
}

export interface IOnlinerPagiantion {
  limit: number;
  items: number;
  current: number;
  last: number;
}

export interface IOnlinerApartment {
  id: number;
  price: {
    amount: string;
    currency: OnlinerCurrences;
    converted: {
      [key: string]: {
        amount: string;
        currency: OnlinerCurrences;
      };
    };
  };
  rent_type: OnlinerRentType;
  location: IOnlinerApartmentLocation;
  photo: string;
  contact: {
    owner: boolean;
  };
  created_at: string;
  last_time_up: string;
  up_available_in: number;
  url: string;
}

export type OnlinerCurrences = 'USD' | 'BYN';

export type OnlinerRentType = '1_rooms' | '2_rooms' | '3_rooms' | '4_rooms' | '5_rooms';

export interface IOnlinerApartmentLocation {
  address: string;
  user_address: string;
  latitude: number;
  longitude: number;
}
