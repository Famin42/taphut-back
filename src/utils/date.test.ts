import * as date from './date';
import { getISODate } from './date';

test('getLastWeekRange', () => {
  const d = new Date('2018-05-01');
  const range = date.getLastWeekRange(d);
  expect(range).toEqual({
    start: '2018-04-22T00:00:00.000Z',
    end: '2018-04-29T00:00:00.000Z',
  });
  const range2 = date.getLastWeekRange(d, 3);
  expect(range2).toEqual({
    start: '2018-04-18T00:00:00.000Z',
    end: '2018-04-25T00:00:00.000Z',
  });

  const range3 = date.getLastWeekRange(d, 4, -4);
  expect(range3).toEqual({
    start: '2018-04-18T20:00:00.000Z',
    end: '2018-04-25T20:00:00.000Z',
  });
});

test('getISODate()', () => {
  expect(getISODate(new Date('2018-06-25T00:00:00.000Z'))).toEqual('2018-06-25');
});

test('stripMillisISO', () => {
  expect(date.stripMillisISO('2018-04-25T20:00:00.000Z')).toEqual('2018-04-25T20:00:00Z');
});
