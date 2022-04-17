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
  remove_user_from_order,
  get_room_by_tag,
  delete_room,
} from '../src';

import {
  start_server,
  shuffle,
} from '../src/utils';
import { finish_turn, start_turn } from '../src/room';

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
  // make sure each test starts with clean collections
  await db.rooms.deleteMany({});
  await db.users.deleteMany({});
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

test('rooms can be recovered by tag', async () => {
  const special_tag = 'unique_room_tag';
  await create_room(db, special_tag);
  await expect(get_room_by_tag(db, special_tag)).resolves.toHaveProperty('tag', special_tag);
});

test('rooms can be deleted', async () => {
  const roomid = await create_room(db, room_tag);
  await expect(get_room(db, roomid)).resolves.toHaveProperty('_id', roomid)
  await delete_room(db, roomid);
  await expect(get_room(db, roomid)).resolves.toBeNull()
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
  expect(result).toHaveProperty('phase', GamePhase.PLAYING); // adding all players to order begins play
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

test('pulling players out of the order', async () => {
  const roomid = await create_room(db, room_tag);
  const userid = await create_user(db);
  const userid2 = await create_user(db);
  await add_player_to_room(db, roomid, userid);
  await add_player_to_room(db, roomid, userid2);
  await advance_room_phase(db, roomid); // ORDERING
  await expect(add_user_to_order(db, roomid, userid)).resolves.toHaveProperty('ordered', [userid.toString()]);
  await expect(remove_user_from_order(db, roomid, userid)).resolves.toHaveProperty('ordered', []);
  await expect(add_user_to_order(db, roomid, userid2)).resolves.toHaveProperty('ordered', [userid2.toString()]);
  const final = await add_user_to_order(db, roomid, userid);
  expect(final).toHaveProperty('ordered', [userid2.toString(), userid.toString()]);
});

test('advancing the turn should work right', async () => {
  const roomid = await create_room(db, room_tag);
  const userid = await create_user(db);
  const userid2 = await create_user(db);
  await add_player_to_room(db, roomid, userid);
  await add_player_to_room(db, roomid, userid2);
  await advance_room_phase(db, roomid); // ORDERING
  await add_user_to_order(db, roomid, userid);
  await add_user_to_order(db, roomid, userid2);
  await expect(get_room(db, roomid)).resolves.toHaveProperty('phase', GamePhase.PLAYING);
  await start_turn(db, roomid, userid, 0);
  await expect(finish_turn(db, roomid, userid, null)).resolves.toHaveProperty('turn.index', 1);
});
