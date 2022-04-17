import {
  ObjectId,
} from 'mongodb';

import {
  get_room,
  create_room,
  get_room_by_tag,
  add_player_to_room,
  create_user,
  get_user,
  associate_user_phone_number,
  verify_user,
  GamePhase,
  advance_room_phase,
  add_user_to_order,
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
      const room = await add_player_to_room(db, new ObjectId(args.room_id), new ObjectId(args.user_id));
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
    addPlayerToOrder: async (parent: any, args: any) => {
      const room = await add_user_to_order(db, new ObjectId(args.room_id), new ObjectId(args.user_id));
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
  }
}
