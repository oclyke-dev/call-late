import {
  ObjectId,
} from 'mongodb';

import {
  Database,
  Room,
} from '.';

export async function create_room(db: Database, tag: string) {
  const room: Room = {
    tag,
    discard_stack: [],
    players:[],
    phase: 0,
    hands: new Map(),
  };
  const result = await db.rooms.insertOne(room);
  return result.insertedId;
}

export async function get_room(db: Database, _id: ObjectId) {
  const result = await db.rooms.findOne({_id});
  return result;
}

export async function add_player_to_room(db: Database, roomid: ObjectId, playerid: ObjectId) {
  await db.rooms.updateOne({_id: roomid}, {$addToSet: {players: playerid.toString()}});
}
