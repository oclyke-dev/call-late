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
    phone: null,
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

export async function increment_user_game_count(db: Database, userid: ObjectId) {
  const {value} = await db.users.findOneAndUpdate({_id: userid}, {$inc: { total_games: 1}}, {returnDocument: 'after'});
  return value;
}

export async function increment_user_win_count(db: Database, userid: ObjectId) {
  const {value} = await db.users.findOneAndUpdate({_id: userid}, {$inc: { total_wins: 1}}, {returnDocument: 'after'});
  return value;
}

export async function associate_user_phone_number(db: Database, userid: ObjectId, phone: string) {
  // only associate phones to users if there is no existing phone or the input matches the existing
  const {value} = await db.users.findOneAndUpdate({_id: userid, phone: {$in: [null, phone]}}, {$set: {phone}}, {returnDocument: 'after'});
  return value;
}
