import {
  ObjectId,
} from 'mongodb';

import {
  Database,
  Room,
  GamePhase,
  Turn,
  CardSource,
  Settings,
  increment_user_game_count,
  increment_user_win_count,
} from '.';

import {
  get_card_from_reserve,
  hand_is_sorted,
} from './utils';

const initial_turn: Turn = {
  index: null,
  user: null,
  card: null,
  source: null,
}

const default_settings: Settings = {
  total_cards: 60,
  cards_per_hand: 10,
}

export async function create_room(db: Database, tag: string) {
  const room: Room = {
    tag,
    discard_stack: [],
    players:[],
    ordered: [],
    phase: 0,
    hands: new Map(),
    turn: initial_turn,
    settings: default_settings,
  };
  const result = await db.rooms.insertOne(room);
  return result.insertedId;
}

export async function get_room(db: Database, _id: ObjectId) {
  return await db.rooms.findOne({_id});
}

export async function get_room_by_tag(db: Database, tag: string) {
  return await db.rooms.findOne({tag});
}

export async function delete_room(db: Database, _id: ObjectId) {
  return await db.rooms.deleteOne({_id});
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
  const {value} = await db.rooms.findOneAndUpdate({_id: roomid}, {$inc: {phase: 1}}, {returnDocument: 'after'});
  if(value === null){ return null; }

  // handle special actions on phase transititions
  if (value.phase === GamePhase.PLAYING){
    for(const id of value.players){
      await increment_user_game_count(db, new ObjectId(id));
    }
  }

  return value;
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

export async function go_to_next_turn(db: Database, roomid: ObjectId) {
  const room = await get_room(db, roomid);
  if(room === null){ return null; }
  
  // get the next turn index
  let next_idx;
  if(room.turn.index === null){
    next_idx = 0;
  } else {
    next_idx = room.turn.index + 1;
  }
  if(next_idx >= room.players.length){
    next_idx = 0;
  }
  const next_user = room.ordered[next_idx];
  const new_turn = {...initial_turn, user: next_user, idx: next_idx};
  const update = { $set: { turn: new_turn} };

  const filter = {
    _id: roomid,
    phase: GamePhase.PLAYING, // game must be in playing state
  }

  const {value} = await db.rooms.findOneAndUpdate(filter, update, {returnDocument: 'after'});
  return value;
}

export async function start_turn(db: Database, roomid: ObjectId, userid: ObjectId, source: CardSource) {
  // player picks up a card from either the DISCARD or the RESERVE
  // (discard comes from the stack, RESERVE can generate a random card value that doesn't include any in the stack or player's hands)
  
  const filter = {
    _id: roomid,
    phase: GamePhase.PLAYING,
    'turn.user': userid.toString(),
  }

  // get room info to compute new card value
  const room = await get_room(db, roomid);
  if(room === null){ return null; }
  let card_value: number;
  switch(source){
    case CardSource.DISCARD:
      const chance = room.discard_stack.shift();
      if(typeof chance === 'undefined'){
        return null;
      }
      card_value = chance;
      break;
    case CardSource.RESERVE:
      try {
        card_value = get_card_from_reserve(room);
      } catch (e) {
        // when get_card_from_reserve throws it means all the reserve cards got picked into the discard pile... simply clearing the discard stack should fix this!
        const chance = room.discard_stack.shift();
        if(typeof chance === 'undefined'){
          return null;
        }
        const top_of_discard = chance; // save the top discard for players to interact with
        const {value} = await db.rooms.findOneAndUpdate(filter, {$set: {discard_stack: [top_of_discard]}}, {returnDocument: 'after'}); // now the updated room should have no discard stack and plenty of cards to choose from
        if(value === null){
          return null;
        }
        const updated_room = value;
        card_value = get_card_from_reserve(updated_room);
      }
      break;
    default:
      return null;
  }

  let update = {
    $set: {
      'turn.source': source,    // the source is now chosen - user can't go back
      'turn.card': card_value,  // value of card is now known to the user
    }
  };
  if(source === CardSource.DISCARD){
    (update as any)['$pop'] = {
      discard_stack: -1, // if the source is the DISCARD stack then also pop the value out of the db array
    }
  }
  const {value} = await db.rooms.findOneAndUpdate(filter, update, {returnDocument: 'after'});
  return value;
}

export async function finish_turn(db: Database, roomid: ObjectId, userid: ObjectId, swap_at_idx: number) {
  // card from user's hand at the chosen index gets pushed onto the discard stack
  // check hand for sortedness
  // (if so, advance game to FINISHED, else turn advances)

  const filter = {
    _id: roomid,
    phase: GamePhase.PLAYING,
    'turn.user': userid.toString(),
    'turn.source': {$ne: null},
    'turn.card': {$ne: null},
  };

  // note: there is probably some slick high performance way to do this with pipelines but I'm gonna be a noob
  const room = await db.rooms.findOne(filter);
  if(room === null){ return null; }

  if(swap_at_idx >= room.settings.cards_per_hand){
    throw new Error('you shouldnt be doing that dude!');
  }

  const first_hand = room.hands.get(userid.toString());
  if(typeof first_hand === 'undefined'){ return null; }

  const card_from_hand = first_hand[swap_at_idx];
  const update = {
    $set: {
      [`hands.${userid.toString()}.${swap_at_idx}`]: card_from_hand,
    }
  }

  const {value} = await db.rooms.findOneAndUpdate(filter, update, {returnDocument: 'after'});
  if(value === null){ return null; }
  const updated_room = value;
  if(updated_room.turn.user === null){ return updated_room; } // this should not happen but it makes TS happy
  const hand = updated_room.hands.get(updated_room.turn.user) ;
  if(typeof hand !== 'undefined'){
    if(hand_is_sorted(hand)){
      await increment_user_win_count(db, userid);
      return await advance_room_phase(db, roomid); // FINISHED
    }
  }
  await go_to_next_turn(db, roomid);
  return updated_room;
}

export async function change_settings(db: Database, roomid: ObjectId, settings: Settings) {
  const filter = {
    _id: roomid,
    phase: GamePhase.WAITING,
  };
  const update = {$set: {settings: settings}}
  const {value} = await db.rooms.findOneAndUpdate(filter, update, {returnDocument: 'after'});
  return value;
}
