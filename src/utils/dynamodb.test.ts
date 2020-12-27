import { DynamoDB_cleanRows } from './dynamodb';

test('DynamoDB_cleanRows', async () => {
  const o = {
    a: 'asdf',
    b: [] as any[],
    c: {},
    d: '',
    e: null as null,
    f: { a: '', b: 'asdf' },
    g: { a: '' },
  };
  const clean = DynamoDB_cleanRows([o]);
  expect(clean).toEqual([
    {
      a: 'asdf',
      b: [],
      c: {},
      f: { b: 'asdf' },
      g: {},
    },
  ]);
});
