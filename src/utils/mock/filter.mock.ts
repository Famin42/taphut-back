import { IFIlter } from 'utils/filter';

export const MOCK_FILTER_1: IFIlter = {
  filterName: 'MOCK_FILTER_1',
};

export const MOCK_FILTER_2: IFIlter = {
  filterName: 'MOCK_FILTER_2',
  city: 'Minsk',
};

export const MOCK_FILTER_3: IFIlter = {
  filterName: 'MOCK_FILTER_3',
  city: 'Minsk',
  currency: 'USD',
};

export const MOCK_FILTER_4: IFIlter = {
  filterName: 'MOCK_FILTER_4',
  city: 'Minsk',
  currency: 'USD',
  minPrice: 100,
};

export const MOCK_FILTER_5: IFIlter = {
  filterName: 'MOCK_FILTER_5',
  city: 'Minsk',
  currency: 'USD',
  minPrice: 100,
  maxPrice: 350,
};

export const MOCK_FILTER_6: IFIlter = {
  filterName: 'MOCK_FILTER_6',
  city: 'Minsk',
  currency: 'USD',
  minPrice: 100,
  maxPrice: 350,
  roomsNumber: 2,
};

export const MOCK_FILTERS: IFIlter[] = [
  MOCK_FILTER_1,
  MOCK_FILTER_2,
  MOCK_FILTER_3,
  MOCK_FILTER_4,
  MOCK_FILTER_5,
  MOCK_FILTER_6,
];
