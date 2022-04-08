import {
  MongoMemoryReplSet,
} from 'mongodb-memory-server';

import {
  MongoClient,
  ObjectId,
} from 'mongodb';

import {
  Database,
  User,
  get_database,
  initialize_database,
  get_user,
  create_user,
  get_users_public,
  associate_user_phone_number,
} from '../src';

import {
  start_server,
} from '../src/utils';


///////////
// fixtures

let db: Database
let client: MongoClient;
let replset: MongoMemoryReplSet;

// see docs on jest setup / teardown as well as handling async code
// https://jestjs.io/docs/setup-teardown
// https://jestjs.io/docs/asynchronous
beforeAll(async () => {
  replset = await start_server();
  const uri = replset.getUri();
  client = new MongoClient(uri);
  db = get_database(client);
  await client.connect();
  await initialize_database(db);
});

afterAll(async () => {
  await client.close();
  await replset.stop();
});

beforeEach(async () => {
  await db.users.deleteMany({}); // deletes all user documents before each test
});

////////
// tests

test('invalid users are not found', async () => {
  await expect(get_user(db, new ObjectId('000000000000000000000000'))).resolves.toBeNull();
});

test('users can be created', async () => {
  await expect(create_user(db)).resolves.toBeInstanceOf(ObjectId);
});

test('users can be recovered', async () => {
  const id = await create_user(db);
  await expect(get_user(db, id)).resolves.toHaveProperty('_id', id);
});

test('many users public info can be found', async () => {
  const num_users = 10;
  const ids = await Promise.all([...new Array(num_users)].map(async () => {
    return create_user(db);
  }));
  const result = await get_users_public(db, ids);
  expect(result).toHaveLength(num_users);
});

test('users can add phone numbers', async () => {
  const phone = '+12025550102';
  const wrong_phone = '+15052250102';
  const id = await create_user(db);
  await expect(get_user(db, id)).resolves.toHaveProperty('phone', null); // users start with no phone number
  await expect(associate_user_phone_number(db, id, phone)).resolves.toHaveProperty('phone', phone); // users can add their number
  await expect(associate_user_phone_number(db, id, wrong_phone)).resolves.toBeNull(); // reject association of a new phone number
  await expect(get_user(db, id)).resolves.toHaveProperty('phone', phone); // original phone should be intact after incorrect association attempt
  const final = await associate_user_phone_number(db, id, phone); // re-association of the original phone number is allowed and returns the user
  expect(final).toHaveProperty('_id', id);
  expect(final).toHaveProperty('phone', phone);
});
