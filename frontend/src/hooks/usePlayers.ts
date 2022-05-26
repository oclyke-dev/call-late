import {
  useState,
  useRef,
  useEffect,
} from 'react';

import {
  User,
  UserPublic,
} from '../../../backend/src'

import {
  fetch_gql,
} from '../utils';

const user_public_fields = `{
  _id
  tag
  color
  total_games
  total_wins
}`;

const user_id_key = 'user_id';

async function create_user(): Promise<string> {
  const result = await fetch_gql(`mutation { createUser }`);
  return result.data.createUser;
}

type UserPublicMap = {[key: string]: UserPublic};

async function get_users_public(ids: string[]): Promise<UserPublicMap | null> {
  const result = await fetch_gql(`query ($ids: [ID!]){ getUsersPublic(ids: $ids)}`, {ids});
  return result.data.getUsersPublic;
}

export function usePlayers (): [UserPublicMap, (ids: string[]) => void] {
  const [players, setPlayers] = useState<UserPublicMap>({});

  async function sync (ids: string[]) {
    const result = await get_users_public(ids);

    console.log('requesting data for: ', ids)
    console.log('got public player info: ', result)

    setPlayers(prev => ({...prev, ...result}));
  }

  return [players, sync]
}
