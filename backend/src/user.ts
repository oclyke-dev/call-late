import {
  ObjectId,
} from 'mongodb';

import {
  Database,
  User,
  UserPublic,
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

function get_public_info(user: User): UserPublic {
  return {
    _id: user._id,
    tag: user.tag,
    color: user.color,
    total_games: user.total_games,
    total_wins: user.total_wins,
  }
}
export async function get_users_public(db: Database, ids: ObjectId[]) {
  const cursor = await db.users.find({_id: {$in: ids}});
  const users = await cursor.toArray();
  const result: {[key: string]: UserPublic} = {};
  users.forEach(u => {
    result[u._id.toString()] = get_public_info(u)
  })
  return result;
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

export async function verify_user(db: Database, _id: ObjectId, phone: string) {
  return await db.users.findOne({_id, phone});
}

export async function user_set_color(db: Database, _id: ObjectId, color: string) {
  const {value} = await db.users.findOneAndUpdate({_id}, {$set: {color}}, {returnDocument: 'after'});
  return value;
}

export async function user_set_tag(db: Database, _id: ObjectId, tag: string) {
  const {value} = await db.users.findOneAndUpdate({_id}, {$set: {tag}}, {returnDocument: 'after'});
  return value;
}
