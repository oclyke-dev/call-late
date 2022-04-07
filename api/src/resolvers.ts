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
} from '../../backend/src';

import {
  db,
} from '.';

import {
  notify_room,
} from './sessions';

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
  },
  Mutation: {
    createRoom: async (parent: any, args: any) => {
      return await create_room(db, args.tag);
    },
    createUser: async (parent: any, args: any) => {
      return await create_user(db);
    },
    addPlayerToRoom: async (parent: any, args: any) => {
      const room = await add_player_to_room(db, new ObjectId(args.room_id), new ObjectId(args.user_id));
      room !== null && await notify_room(room._id.toString());
      return room;
    },
  }
}
