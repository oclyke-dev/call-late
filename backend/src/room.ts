import {
  ObjectId,
} from 'mongodb';

import {
  Database,
  Room,
  GamePhase,
} from '.';

export async function create_room(db: Database, tag: string) {
  const room: Room = {
    tag,
    discard_stack: [],
    players:[],
    ordered: [],
    phase: 0,
    hands: new Map(),
  };
  const result = await db.rooms.insertOne(room);
  return result.insertedId;
}

export async function get_room(db: Database, _id: ObjectId) {
  return await db.rooms.findOne({_id});
}

export async function add_player_to_room(db: Database, roomid: ObjectId, userid: ObjectId) {
  const filter = {
    _id: roomid,
    phase: {$lte: GamePhase.WAITING} // ensure that players can only be added when the game is waiting
  };
  const {value} = await db.rooms.findOneAndUpdate(filter, {$addToSet: {players: userid.toString()}}, {returnDocument: 'after'});
  return value;
}

export async function advance_room_phase(db: Database, roomid: ObjectId) {
  const result = await db.rooms.findOneAndUpdate({_id: roomid}, {$inc: {phase: 1}}, {returnDocument: 'after'});
  return result.value;
}

export async function add_user_to_order(db: Database, roomid: ObjectId, userid: ObjectId) {
  const filter = {
    _id: roomid,
    phase: GamePhase.ORDERING, // only valid during ordering phase
    players: {$all: [userid.toString()]}, // only operate on rooms which have this player in the players list
    ordered: {$nin: [userid.toString()]}, // don't add the player if they are already in the player's list
  };
  let {value} = await db.rooms.findOneAndUpdate(filter, {$push: {ordered: userid.toString()}}, {returnDocument: 'after'});
  if((value !== null) && (value.ordered.length === value.players.length)){
    return await advance_room_phase(db, roomid);
  }
  return value;
}

export async function remove_user_from_order(db: Database, roomid: ObjectId, userid: ObjectId) {
  const filter = {
    _id: roomid,
    phase: GamePhase.ORDERING, // only valid during ordering phase
    players: {$all: [userid.toString()]}, // only operate on rooms which have this player in the players list
    ordered: {$all: [userid.toString()]}, // only remove the player if they are already in the ordered list
  };
  const {value} = await db.rooms.findOneAndUpdate(filter, {$pull: {ordered: userid.toString()}}, {returnDocument: 'after'});
  return value;
}
