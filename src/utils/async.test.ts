import { eachLimit, sleep, rejectAfter } from './async';

async function tester(x: number) {
  await sleep(Math.random() * 10);
  return 2 * x;
}

async function testerFast(x: number) {
  // sleep for just 1ms
  await sleep(1);
  return 2 * x;
}

async function testerBad() {
  await sleep(10);
  throw new Error('I was naughty!');
}

test('eachLimit', async () => {
  const input = [...Array.from(Array(100).keys())];
  const res = await eachLimit(input, tester);
  expect(res).toEqual(input.map((x) => 2 * x));

  const res2 = await eachLimit(input, testerFast);
  expect(res2).toEqual(input.map((x) => 2 * x));

  await expect(eachLimit([2000], sleep, 10, 10)).rejects.toThrow;
  const res3 = await eachLimit([100], sleep, 10, 2000);
  expect(res3).toEqual([undefined]);
  await expect(eachLimit(input, testerBad)).rejects.toThrow;
});

test('rejectAfter', async () => {
  try {
    await rejectAfter(1);
  } catch (e) {
    expect(e.name).toEqual('RejectAfter');
  }
  expect.assertions(1);
});
