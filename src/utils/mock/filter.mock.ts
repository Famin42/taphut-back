import { IFilter } from 'utils/filter';

export const MOCK_FILTER_1: IFilter = {
  filterName: 'MOCK_FILTER_1',
};

export const MOCK_FILTER_2: IFilter = {
  filterName: 'MOCK_FILTER_2',
  city: 'Minsk',
};

export const MOCK_FILTER_3: IFilter = {
  filterName: 'MOCK_FILTER_3',
  city: 'Minsk',
  currency: 'USD',
};

export const MOCK_FILTER_4: IFilter = {
  filterName: 'MOCK_FILTER_4',
  city: 'Minsk',
  currency: 'USD',
  minPrice: 100,
};

export const MOCK_FILTER_5: IFilter = {
  filterName: 'MOCK_FILTER_5',
  city: 'Minsk',
  currency: 'USD',
  minPrice: 100,
  maxPrice: 350,
};

export const MOCK_FILTER_6: IFilter = {
  filterName: 'MOCK_FILTER_6',
  city: 'Minsk',
  currency: 'USD',
  minPrice: 100,
  maxPrice: 350,
  roomsNumber: 2,
};

export const MOCK_FILTERS: IFilter[] = [
  MOCK_FILTER_1,
  MOCK_FILTER_2,
  MOCK_FILTER_3,
  MOCK_FILTER_4,
  MOCK_FILTER_5,
  MOCK_FILTER_6,
];
