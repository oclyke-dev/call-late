import {
  ObjectId,
} from 'mongodb';

import {
  Database,
  User,
} from '.';

// stand-in functions to help make new users
function get_random_color() {
  return '#3dffd2';
}

function get_random_tag() {
  return 'mario';
}

export async function create_user(db: Database) {
  const user: User = {
    tag: get_random_tag(),
    color: get_random_color(),
    total_games: 0,
    total_wins: 0,
  };
  const result = await db.users.insertOne(user);
  return result.insertedId;
}

export async function get_user(db: Database, _id: ObjectId) {
  return await db.users.findOne({_id});
}

function get_public_info(user: User) {
  return {
    tag: user.tag,
    color: user.color,
    total_games: user.total_games,
    total_wins: user.total_wins,
  }
}
export async function get_users_public(db: Database, ids: ObjectId[]) {
  const cursor = await db.users.find({_id: {$in: ids}});
  const users = await cursor.toArray();
  return users.map(u => get_public_info(u));
}

