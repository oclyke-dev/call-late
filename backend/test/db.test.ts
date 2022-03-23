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

test('verify connection', async () => {
  await expect(client.db('admin').command({ ping: 1 })).resolves.toHaveProperty('ok', 1);
});

test('able to operate on db', async () => {
  const collection = '1'; // name of collection does not matter
  const newdoc = {'type': 'fast'};
  await expect(client.db().collection(collection).insertOne(newdoc)).resolves.toHaveProperty('acknowledged', true);
  await expect(client.db().collection(collection).findOne(newdoc)).resolves.toHaveProperty('_id');  
});

test('to see dbs', async () => {
  await client.db('super').collection('234').insertOne({'flavor': 'pie'});
  await expect(client.db().admin().listDatabases()).resolves.toHaveProperty('databases');
});
