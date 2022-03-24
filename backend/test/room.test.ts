import {
  MongoMemoryReplSet,
} from 'mongodb-memory-server';

import {
  MongoClient,
  ObjectId,
} from 'mongodb';

import {
  Database,
  GamePhase,
  get_database,
  initialize_database,
  get_room,
  create_room,
  create_user,
  add_player_to_room,
  advance_room_phase,
  add_user_to_order,
} from '../src';

import {
  start_server,
  shuffle,
} from '../src/utils';

let db: Database
let client: MongoClient;
let replset: MongoMemoryReplSet;

const room_tag = 'test_room';

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
  await db.rooms.deleteMany({}); // make sure each test starts with clean collection of rooms
});

test('invalid rooms are not found', async () => {
  await expect(get_room(db, new ObjectId('000000000000000000000000'))).resolves.toBeNull();
});

test('rooms can be created', async () => {
  await expect(create_room(db, room_tag)).resolves.toBeInstanceOf(ObjectId);
});

test('rooms can be recovered', async () => {
  const id = await create_room(db, room_tag);
  await expect(get_room(db, id)).resolves.toHaveProperty('_id', id);
});

test('players can be added during waiting phase', async () => {
  const playerid = new ObjectId();
  const roomid = await create_room(db, room_tag);
  await expect(add_player_to_room(db, roomid, playerid)).resolves.toHaveProperty('players', [playerid.toString()]);
});

test('two identical tags to fail', async () => {
  await create_room(db, room_tag);
  await expect(create_room(db, room_tag)).rejects.toThrow('duplicate key error');
})

test('room phase increments properly', async () => {
  const roomid = await create_room(db, room_tag);
  await expect(get_room(db, roomid)).resolves.toHaveProperty('phase', GamePhase.WAITING);
  await expect(advance_room_phase(db, roomid)).resolves.toHaveProperty('phase', GamePhase.ORDERING);
  await expect(advance_room_phase(db, roomid)).resolves.toHaveProperty('phase', GamePhase.PLAYING);
  await expect(advance_room_phase(db, roomid)).resolves.toHaveProperty('phase', GamePhase.FINISHED);
})

test('users cant join games that are playing or finished', async () => {
  const roomid = await create_room(db, room_tag);
  const playerid = await create_user(db);
  await advance_room_phase(db, roomid); // advance to 'ORDERING'
  await expect(add_player_to_room(db, roomid, playerid)).resolves.toBeNull();
  await advance_room_phase(db, roomid); // advance to 'PLAYING'
  await expect(add_player_to_room(db, roomid, playerid)).resolves.toBeNull();
  await advance_room_phase(db, roomid); // advance to 'FINISHED'
  await expect(add_player_to_room(db, roomid, playerid)).resolves.toBeNull();
});

test('setting the order of players', async () => {
  const num_users = 4;
  const roomid = await create_room(db, room_tag);
  const userids = await Promise.all([...new Array(num_users)].map(async () => {
    return create_user(db);
  }));
  await Promise.all(userids.map(async id => add_player_to_room(db, roomid, id)));
  await advance_room_phase(db, roomid);
  const orders = shuffle(userids.map((_, idx) => idx));
  let result;
  for (const idx of orders) {
    result = await add_user_to_order(db, roomid, userids[idx])
  }
  expect(result).toHaveProperty('ordered', orders.map(idx => userids[idx].toString()));
});

test('setting order outside ORDERING phase', async () => {
  const roomid = await create_room(db, room_tag);
  const userid = await create_user(db);
  await expect(add_user_to_order(db, roomid, userid)).resolves.toBeNull();
  await advance_room_phase(db, roomid); // ORDERING
  await advance_room_phase(db, roomid); // PLAYING
  await expect(add_user_to_order(db, roomid, userid)).resolves.toBeNull();
  await advance_room_phase(db, roomid); // FINISHED
  await expect(add_user_to_order(db, roomid, userid)).resolves.toBeNull();
});
