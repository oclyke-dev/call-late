import {
  ObjectId,
} from 'mongodb';

import {
  Database,
  Room,
  Hand,
  GamePhase,
  Turn,
  CardSource,
  Settings,
  PlayerEntry,
  increment_user_game_count,
  increment_user_win_count,
} from '.';

import {
  get_card_from_reserve,
  hand_is_sorted,
  get_initial_cards,
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
if(process.env.NODE_ENV === 'development'){
  default_settings.cards_per_hand = 6;
}

function make_room(tag: string): Room {
  return {
    tag,
    discard_stack: [],
    players:{},
    ordered: [],
    phase: 0,
    hands: {},
    turn: initial_turn,
    settings: default_settings,
    winner: null,
    initialized: false,
  };
}

export async function create_room(db: Database, tag: string) {
  const room = make_room(tag);
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

export async function reset_room(db: Database, roomid: ObjectId, tag: string) {
  const {value} = await db.rooms.findOneAndReplace({_id: roomid, tag, phase: GamePhase.FINISHED}, make_room(tag), {returnDocument: 'after'});
  return value;
}

export async function add_player_to_room(db: Database, roomid: ObjectId, userid: ObjectId) {
  const idstring = userid.toString();
  const filter: any = {
    _id: roomid,
    phase: {$lte: GamePhase.WAITING}, // ensure that players can only be added when the game is waiting
    [`players.${idstring}`]: {$exists: false},
  };
  const entry: PlayerEntry = {
    order: 0,
  }
  const {value} = await db.rooms.findOneAndUpdate(filter, {$set: {[`players.${idstring}`]: entry}}, {returnDocument: 'after'});
  if(value === null){ return null; }
  return await set_players_order(db, roomid, []);
}

export async function remove_player_from_room(db: Database, roomid: ObjectId, userid: ObjectId) {
  const removeid = userid.toString();

  // players can be removed from a gam at any time
  const filter = {
    _id: roomid,
    [`players.${removeid}`]: {$exists: true},
  };
  const room = await db.rooms.findOne(filter);
  if(room === null){ return null; }

  // rebuild the list of players
  // make sure to remove this player from the ordered array also
  const prevordered = [...room.ordered];
  const unordered = Object.keys(room.players).filter(id => (!prevordered.includes(id)));
  const ordered = [...prevordered, ...unordered].filter(id => (id !== removeid));

  const players: {[key: string]: PlayerEntry} = {};
  ordered.forEach((id, idx) => {
    players[id] = {...room.players[id], order: idx};
  });

  // make sure to check the current turn to make sure other players can continue to play
  const turn = {...room.turn};
  if(turn.user && turn.index){
    
    if(turn.user === removeid){
      // if removing the player whose turn it currently is:
      let next_idx = turn.index + 1; // advance to the next user
      if(next_idx >= ordered.length){
        next_idx = 0;
      }
      turn.index = next_idx;
      turn.user = ordered[next_idx];
    } else {
      // if removing some other player
      const next_player = turn.user;
      const next_idx = ordered.indexOf(next_player);
      if(next_idx < 0){
        throw new Error('expected to find index of next player');
      }
      turn.index = next_idx;
    }

  }

  // make the actual update
  const update = {
    $set: {
      turn,
      players,
      ordered,
    }
  };
  const {value} = await db.rooms.findOneAndUpdate(filter, update, {returnDocument: 'after'});
  return value;
}

export async function advance_room_phase(db: Database, roomid: ObjectId) {
  const {value} = await db.rooms.findOneAndUpdate({_id: roomid, phase: {$lt: GamePhase.FINISHED}}, {$inc: {phase: 1}}, {returnDocument: 'after'});
  if(value === null){ return null; }

  // handle special actions on phase transititions
  if (value.phase === GamePhase.PLAYING){
    let room = await initialize_state(db, roomid);
    room = await go_to_next_turn(db, value._id);
    await Promise.all(Object.keys(value.players).map(async (id) => {
      await increment_user_game_count(db, new ObjectId(id));
    }));
    return room;
  }
  if (value.phase === GamePhase.FINISHED){
    return await initialize_turn_state(db, roomid);
  }

  return value;
}

export async function set_players_order(db: Database, roomid: ObjectId, orderedids: ObjectId[]) {
  // note: if the ordered ids do not include all players then unlisted players are randomly assigned an order after ordered players
  const filter = {
    _id: roomid, phase: GamePhase.WAITING
  };
  const room = await db.rooms.findOne(filter);
  if(room === null){ return null; }

  const ordered_strings = orderedids.map(id => id.toString());
  const unordered_players = Object.keys(room.players).filter(id => (!ordered_strings.includes(id)));
  const final_order = [...ordered_strings, ...unordered_players];

  const update: any = {
    $set: {
      ordered: final_order,
    }
  };
  final_order.forEach((id, idx) => {
    update.$set[`players.${id}.order`] = idx;
  });

  const {value} = await db.rooms.findOneAndUpdate({_id: roomid}, update, {returnDocument: 'after'});
  return value;
}

export async function initialize_turn_state(db: Database, room_id: ObjectId) {
  const {value} = await db.rooms.findOneAndUpdate({_id: room_id}, {$set: {turn: initial_turn}}, {returnDocument: 'after'});
  return value;
}

export async function go_to_next_turn(db: Database, roomid: ObjectId) {
  const filter = {
    _id: roomid,
    phase: GamePhase.PLAYING, // game must be in playing state
  }
  const room = await db.rooms.findOne(filter);
  if(room === null){ return null; }
  
  // get the next turn index
  let next_idx;
  if(room.turn.index === null){
    next_idx = 0;
  } else {
    next_idx = room.turn.index + 1;
  }
  if(next_idx >= room.ordered.length){
    next_idx = 0;
  }
  const next_user = room.ordered[next_idx];
  const new_turn = {...initial_turn, user: next_user, index: next_idx};
  const update = { $set: { turn: new_turn} };

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

export async function finish_turn(db: Database, roomid: ObjectId, userid: ObjectId, swap_at_idx: number | null) {
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

  const card_from_turn = room.turn.card;

  if(swap_at_idx === null) {
    // user wants to just discard this card...
    const update = {
      $push: {
        discard_stack: {
          $each: [card_from_turn],
          $position: 0,
        }
      },
    };

    await db.rooms.findOneAndUpdate(filter, (update as any), {returnDocument: 'after'});
  } else {
    if(swap_at_idx >= room.settings.cards_per_hand){
      throw new Error('you shouldnt be doing that dude!');
    }
  
    const first_hand = room.hands[userid.toString()];
    if(typeof first_hand === 'undefined'){ return null; }
  
    const card_from_hand = first_hand[swap_at_idx];
    const update = {
      $set: {
        [`hands.${userid.toString()}.${swap_at_idx}`]: card_from_turn,
      },
      $push: {
        discard_stack: {
          $each: [card_from_hand],
          $position: 0,
        }
      }
    }
  
    const {value} = await db.rooms.findOneAndUpdate(filter, (update as any), {returnDocument: 'after'});
    if(value === null){ return null; }
    const updated_room = value;
    if(updated_room.turn.user === null){ return updated_room; } // this should not happen but it makes TS happy
    
    const hand = updated_room.hands[updated_room.turn.user];
    if(typeof hand !== 'undefined'){
      if(hand_is_sorted(hand)){
        await increment_user_win_count(db, userid);
        await set_winner(db, roomid, userid);
        return await advance_room_phase(db, roomid); // FINISHED
      }
    }
  }

  return await go_to_next_turn(db, roomid);
}

export async function change_settings(db: Database, roomid: ObjectId, settings: Partial<Settings>) {
  const filter = {
    _id: roomid,
    phase: GamePhase.WAITING,
  };
  const room = await db.rooms.findOne(filter);
  if(room === null){ return null; }
  
  const update: {$set: any} = { $set: {}};
  if(typeof settings.cards_per_hand !== 'undefined' && settings.cards_per_hand !== null){
    update.$set['settings.cards_per_hand'] = settings.cards_per_hand;
  }
  if(typeof settings.total_cards !== 'undefined' && settings.total_cards !== null){
    update.$set['settings.total_cards'] = settings.total_cards;
  }

  const {value} = await db.rooms.findOneAndUpdate(filter, update, {returnDocument: 'after'});
  return value;
}

export async function initialize_state(db: Database, roomid: ObjectId) {
  const filter = {
    _id: roomid,
    initialized: false, // room must not have been initialized yet
  };
  
  let room = await db.rooms.findOne(filter);
  if(room === null){ return null; }

  const num_players = room.players.length;
  const total_cards = room.settings.total_cards;
  const cards_per_hand = room.settings.cards_per_hand;
  
  const initial_cards = get_initial_cards(total_cards, num_players, cards_per_hand);

  const hands: {[key: string]: Hand} = {};
  let idx = 0;
  for(const player_index in room.players){
    const player = room.players[player_index];
    hands[player] = initial_cards.slice(cards_per_hand*(idx), cards_per_hand*(idx+1));
    idx += 1;
  }
  const discard_stack = initial_cards.slice(-1);

  const result = await db.rooms.findOneAndUpdate(filter, {$set: {discard_stack, hands, initialized: true}}, {returnDocument: 'after'});
  room = result.value;

  return room;
}

export async function set_winner(db: Database, roomid: ObjectId, userid: ObjectId){
  const {value} = await db.rooms.findOneAndUpdate({_id: roomid, winner: null}, {$set: {winner: userid.toString()}});
  return value;
}
