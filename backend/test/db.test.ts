import {
  start_server,
} from '../src/utils';

import {
  MongoMemoryReplSet
} from 'mongodb-memory-server';

import {
  MongoClient
} from 'mongodb';

let client: MongoClient;
let replset: MongoMemoryReplSet;

// see docs on jest setup / teardown as well as handling async code
// https://jestjs.io/docs/setup-teardown
// https://jestjs.io/docs/asynchronous
beforeAll(async () => {
  replset = await start_server();
  const uri = replset.getUri();
  client = new MongoClient(uri);
  await client.connect();
});

afterAll(async () => {
  await client.close();
  await replset.stop();
});

test('this test to make the test suite valid', () => {
  expect(true).toBeTruthy();
});

test('that the client is provided by beforeAll()', () => {
  expect(client).toBeDefined();
});
