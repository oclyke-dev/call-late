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
  remove_player_from_room,
  advance_room_phase,
  get_room_by_tag,
  delete_room,
  CardSource,
} from '../src';

import {
  start_server,
  shuffle,
} from '../src/utils';
import { finish_turn, set_players_order, start_turn } from '../src/room';

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
  await expect(add_player_to_room(db, roomid, playerid)).resolves.toHaveProperty(`players.${playerid.toString()}`, {order: 0});
});

test('players cant join a room twice', async () => {
  const playerid = new ObjectId();
  const roomid = await create_room(db, room_tag);
  await add_player_to_room(db, roomid, playerid);
  await expect(add_player_to_room(db, roomid, playerid)).resolves.toBeNull();
});

test('two identical tags to fail', async () => {
  await create_room(db, room_tag);
  await expect(create_room(db, room_tag)).rejects.toThrow('duplicate key error');
})

test('room phase increments properly', async () => {
  const roomid = await create_room(db, room_tag);
  await expect(get_room(db, roomid)).resolves.toHaveProperty('phase', GamePhase.WAITING);
  await expect(advance_room_phase(db, roomid)).resolves.toHaveProperty('phase', GamePhase.PLAYING);
  await expect(advance_room_phase(db, roomid)).resolves.toHaveProperty('phase', GamePhase.FINISHED);
  await expect(advance_room_phase(db, roomid,)).resolves.toBeNull(); // room phase cannot be advanced past finished
})

test('users cant join games that are playing or finished', async () => {
  const roomid = await create_room(db, room_tag);
  const playerid = await create_user(db);
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
  const orderedids = shuffle(userids);
  const result = await set_players_order(db, roomid, orderedids);
  expect(result).toHaveProperty('ordered', orderedids.map(id => id.toString()));
});

test('setting order outside WAITING phase', async () => {
  const roomid = await create_room(db, room_tag);
  const userid = await create_user(db);
  await add_player_to_room(db, roomid, userid);
  await expect(set_players_order(db, roomid, [])).resolves.toHaveProperty('ordered', [userid.toString()]);
  await advance_room_phase(db, roomid); // PLAYING
  await expect(set_players_order(db, roomid, [])).resolves.toBeNull();
  await advance_room_phase(db, roomid); // FINISHED
  await expect(set_players_order(db, roomid, [])).resolves.toBeNull();
});

test('removing players from the game', async () => {
  const roomid = await create_room(db, room_tag);
  const userid = await create_user(db);
  const userid2 = await create_user(db);
  await add_player_to_room(db, roomid, userid);
  await add_player_to_room(db, roomid, userid2);
  await expect(set_players_order(db, roomid, [userid2, userid])).resolves.toHaveProperty('ordered', [userid2.toString(), userid.toString()]);
  
  let result = await remove_player_from_room(db, roomid, userid2);
  expect(result).toHaveProperty('ordered', [userid.toString()]);
  expect(result).toHaveProperty('players', {[`${userid.toString()}`]: {order: 0}});

  result = await remove_player_from_room(db, roomid, userid);
  expect(result).toHaveProperty('ordered', []);
  expect(result).toHaveProperty('players', {});
});

test('advancing the turn should work right', async () => {
  const roomid = await create_room(db, room_tag);
  const userid = await create_user(db);
  const userid2 = await create_user(db);
  await add_player_to_room(db, roomid, userid);
  await add_player_to_room(db, roomid, userid2);
  await set_players_order(db, roomid, [userid, userid2]);
  await expect(advance_room_phase(db, roomid)).resolves.toHaveProperty('phase', GamePhase.PLAYING);

  let result = await start_turn(db, roomid, userid, CardSource.DISCARD);
  expect(result).toHaveProperty('turn.user', userid.toString());
  expect(result).toHaveProperty('turn.index', 0);
  expect(result).toHaveProperty('turn.source', CardSource.DISCARD);

  result = await finish_turn(db, roomid, userid, null);
  expect(result).toHaveProperty('turn.user', userid2.toString());
  expect(result).toHaveProperty('turn.index', 1);
  expect(result).toHaveProperty('turn.source', null);
});
