import { sleep, retryNTimes } from './async';

async function retryFast() {
  await sleep(1);
  return 'hello';
}

async function retrySlow() {
  await sleep(100);
  return 'hello';
}

test('retryNHappyPath', async () => {
  const timeOut = 1000;
  const maxTries = 1;

  const result = await retryNTimes({
    func: retryFast,
    timeOut,
    maxTries,
  });

  expect(result).toEqual('hello');
});

test('retryNSadPath', async () => {
  const timeOut = 1;
  const maxTries = 5;

  try {
    await retryNTimes({ func: retrySlow, timeOut, maxTries });
    expect(true).toEqual(false);
  } catch {
    expect(true).toEqual(true);
  }
  expect.assertions(1);
});

test('retryNTriesMultiple', async () => {
  const timeOut = 1;
  const maxTries = 50;
  const mockCallback = jest.fn(retrySlow);

  try {
    await retryNTimes({ func: mockCallback, timeOut, maxTries });
  } catch {
    // pass
  }
  expect(mockCallback.mock.calls.length).toEqual(50);
});
