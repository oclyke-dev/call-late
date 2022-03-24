import {
  MongoMemoryReplSet,
} from 'mongodb-memory-server';

import {
  MongoClient,
  ObjectId,
} from 'mongodb';

import {
  Database,
  Room,
  get_database,
  initialize_database,
  get_room,
  create_room,
  add_player_to_room,
} from '../src';

import {
  start_server,
} from '../src/utils';

let db: Database
let client: MongoClient;
let replset: MongoMemoryReplSet;

// a helper for making rooms with unique tags
const room_tag = 'test_room';
let tag_counter = 0;
function get_test_tag() {
  tag_counter++;
  return `${room_tag}_${tag_counter}`; 
}

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

test('invalid rooms are not found', async () => {
  await expect(get_room(db, new ObjectId('000000000000000000000000'))).resolves.toBeNull();
});

test('rooms can be created', async () => {
  await expect(create_room(db, get_test_tag())).resolves.toBeInstanceOf(ObjectId);
});

test('rooms can be recovered', async () => {
  const id = await create_room(db, get_test_tag());
  await expect(get_room(db, id)).resolves.toHaveProperty('_id', id);
});

test('players can be added', async () => {
  const playerid = new ObjectId();
  const roomid = await create_room(db, get_test_tag());
  await add_player_to_room(db, roomid, playerid);
  await expect(get_room(db, roomid)).resolves.toHaveProperty('players', [playerid.toString()]);
});

test('two identical tags to fail', async () => {
  await create_room(db, room_tag);
  await expect(create_room(db, room_tag)).rejects.toThrow('duplicate key error');
})
