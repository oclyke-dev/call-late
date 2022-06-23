import {
  MongoClient,
} from 'mongodb';

import {
  MongoMemoryReplSet
} from 'mongodb-memory-server';

import {
  Database,
  Room,
  Hand,
} from '.';

function memorydb_allowed() {
  return (typeof process.env.ALLOW_MEMORY_DB !== 'undefined') ? true : false;
}

export async function start_server() {
  return new Promise<MongoMemoryReplSet>((resolve, reject) => {
    if((process.env.NODE_ENV === 'production') && (!memorydb_allowed())){
      reject('memory server not allowed');
    }

    // see docs for mongodb-memory-server
    // https://github.com/nodkz/mongodb-memory-server
    MongoMemoryReplSet.create({ replSet: { count: 4 } })
    .then(resolve)
    .catch(reject);
  });
}

export function get_database(client: MongoClient) {
  const db: Database = {
    rooms: client.db().collection('rooms'),
    users: client.db().collection('users'),
  };
  return db;
}

export async function initialize_database(db: Database) {
  // this is to be called on brand-new databases
  const result = await db.rooms.createIndex({tag: 'text'}, {unique: true});
}

export function shuffle<T>(array: Array<T>) {
  // https://bost.ocks.org/mike/shuffle/
  var m = array.length
  let t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

export function get_card_from_reserve(room: Room): number {
  // the idea is to get a valid card for the game

  // values which are off-limits are those used in the discard pile or player's hands
  let used = [...room.discard_stack];
  for (const key in room.hands) {
    const hand = room.hands[key];
    if(typeof hand !== 'undefined'){
      used = used.concat(hand);
    } 
  }

  // the room settings tell us how many total cards there are to choose from:
  const total_cards = room.settings.total_cards;

  // now, we can do a few strategies to get the card depending on our expected luck:
  // 1) if few cards are used already then we can guess a number and see if it exists in the used category
  // 2) if many cards are already used... hmmm can't think of anything clever right now haha

  // so we'll go with option 1) except when half the cards are already used, then we will generate the entire list in memory and remove already used values (yuck... where's a CS major when you need one?)
  if(used.length >= (total_cards/2)){
    // https://medium.com/@alvaro.saburido/set-theory-for-arrays-in-es6-eb2f20a61848
    const possibilities = [...new Array(total_cards)].map((_, idx) => idx); // build giant array of all possibilities
    let difference = possibilities.filter(x => !used.includes(x));
    if(difference.length === 0){
      throw new Error('no more cards left!');
    }
    const idx = Math.floor(Math.random() * difference.length);
    return difference[idx];
  }else{
    let guess;
    do {
      guess = Math.floor(Math.random() * total_cards); // E [0, total_cards)
    } while (used.includes(guess));
    return guess;
  }
}

export function hand_is_sorted(hand: Hand): boolean {
  const signs: number[] = [];
  hand.forEach((x, idx, arr) => {
    if(idx !== 0){
      signs.push(Math.sign(arr[idx] - arr[idx-1]));
    }
  });
  if(signs.length < 2){
    return true;
  }
  let pos_count = 0;
  let neg_count = 0;
  signs.forEach(s => {
    if(s === -1){
      neg_count += 1;
    }
    if(s === 1){
      pos_count += 1;
    }
    if(s === 0){
      throw new Error('there should be no duplicate cards so sign should never be zero')
    }
  })
  if((neg_count !== 0) && (pos_count !== 0)){
    return false; // must have zero of one to be sorted
  }
  return true;
}

export function get_initial_cards(total_cards: number, num_players: number, cards_per_hand: number): number[] {
  // returns num_players*cards_per_hand + 1 cards all drawn from a deck with card values in [0, total_cards)
  // the +1 card should be used as the initial

  const num_cards = num_players*cards_per_hand + 1;
  const all_cards = [...new Array(total_cards)].map((_, idx) => idx); // this gets all the cards (not the most efficient way to do this... but whatever)
  const shuffled = shuffle<number>(all_cards);
  
  return shuffled.slice(-1*num_cards);
}
