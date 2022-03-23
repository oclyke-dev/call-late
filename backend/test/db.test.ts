import {
  connect,
  disconnect,
} from '../src/utils';

import {
  MongoClient
} from 'mongodb';

let client: MongoClient;

// see docs on jest setup / teardown as well as handling async code
// https://jestjs.io/docs/setup-teardown
// https://jestjs.io/docs/asynchronous
beforeAll(() => {
  return new Promise<void>((resolve, reject) => {
    connect()
    .then(c => {
      client = c;
      resolve();
    })
    .catch(reject);
  });
});

afterAll(() => {
  return disconnect();
});

test('this test to make the test suite valid', () => {
  expect(true).toBeTruthy();
});

test('that the client is provided by beforeAll()', () => {
  expect(client).toBeDefined();
});
