import {
  ObjectId,
} from 'mongodb';

import {
  get_room,
  create_room,
  get_room_by_tag,
  add_player_to_room,
  set_player_playing,
  set_players_order,
  create_user,
  get_user,
  get_users_public,
  associate_user_phone_number,
  verify_user,
  GamePhase,
  advance_room_phase,
  end_playing_game,
  change_settings,
  reset_room,
} from '../../backend/src';

import {
  db,
} from '.';

import {
  notify_room,
} from './sessions';

import {
  send_id_text,
} from './utils';
import { finish_turn, start_turn } from '../../backend/src/room';

export const resolvers: any = {
  Query: {
    getRoomById: async (parent: any, args: any) => {
      return await get_room(db, new ObjectId(args.id));
    },
    getRoomByTag: async (parent: any, args: any) => {
      return await get_room_by_tag(db, args.tag);
    },
    getUserById: async (parent: any, args: any) => {
      return await get_user(db, new ObjectId(args.id));
    },
    verifyUser: async (parent: any, args: any) => {
      return await verify_user(db, new ObjectId(args.id), args.phone);
    },
    getUsersPublic: async (parent: any, args: any) => {
      const ids = (args as {ids: string[]}).ids.map(id => new ObjectId(id));
      return await get_users_public(db, ids);
    },
  },
  Mutation: {
    createRoom: async (parent: any, args: any) => {
      return await create_room(db, args.tag);
    },
    createUser: async (parent: any, args: any) => {
      const id = await create_user(db);
      return id;
    },
    addPlayerToRoom: async (parent: any, args: any) => {
      let room = await add_player_to_room(db, new ObjectId(args.room_id), new ObjectId(args.user_id));
      room = await set_player_playing(db, new ObjectId(args.room_id), new ObjectId(args.user_id), true);
      room !== null && await notify_room(room._id.toString());
      return room;
    },
    startGame: async (parent: any, args: any) => {
      let room = await get_room(db, new ObjectId(args.room_id));
      if(room === null){ throw new Error('room not found'); }
      if(room.phase !== GamePhase.WAITING){ throw new Error('game already started'); }
      room = await advance_room_phase(db, new ObjectId(args.room_id));
      room !== null && await notify_room(room._id.toString());
      return room;
    },
    endGameInProgress: async (parent: any, args: any) => {
      const room = await end_playing_game(db, new ObjectId(args.room_id));
      room !== null && await notify_room(room._id.toString());
      return room;
    },
    resetRoom: async (parent: any, args: any) => {
      const room = await reset_room(db, new ObjectId(args.room_id), args.tag);
      room !== null && await notify_room(room._id.toString());
      return room;
    },
    setPlayerOrders: async (parent: any, args: any) => {
      const ordered = args.ordered.map((id: any) => (new ObjectId(id)));
      const room = await set_players_order(db, new ObjectId(args.room_id), ordered);
      room !== null && await notify_room(room._id.toString());
      return room;
    },
    startTurn: async (parent: any, args: any) => {
      const room = await start_turn(db, new ObjectId(args.room_id), new ObjectId(args.user_id), args.card_source);
      room !== null && await notify_room(room._id.toString());
      return room;
    },
    finishTurn: async (parent: any, args: any) => {
      const room = await finish_turn(db, new ObjectId(args.room_id), new ObjectId(args.user_id), args.swap_index);
      room !== null && await notify_room(room._id.toString());
      return room;
    },
    addPhoneNumberToUser: async (parent: any, args: any) => {
      const result = await associate_user_phone_number(db, new ObjectId(args.id), args.phone);
      if(result !== null){
        await send_id_text(args.id, args.phone);
      }
      return result;
    },
    changeCardsPerHand: async (parent: any, args: any) => {
      const roomid = new ObjectId(args.room_id);
      const settings = {cards_per_hand: args.cards_per_hand};
      const room = await change_settings(db, roomid, settings);
      room !== null && await notify_room(roomid.toString());
      return room;
    },
    changeTotalCards: async (parent: any, args: any) => {
      const roomid = new ObjectId(args.room_id);
      const settings = {total_cards: args.total_cards};
      const room = await change_settings(db, roomid, settings);
      room !== null && await notify_room(roomid.toString());
      return room;
    },
  }
}
