import React from 'react';
import {
  useState,
  useRef,
  useEffect,
} from 'react';

import {
  User,
} from '../../../backend/src'

import {
  fetch_gql,
} from '../utils';

const user_fields = `{
  _id
  tag
  color
  total_games
  total_wins
}`;

async function create_user(): Promise<string> {
  const result = await fetch_gql(`mutation { createUser }`);
  return result.data.createUser;
}

async function get_user(id: string): Promise<User> {
  const result = await fetch_gql(`query ($id: ID!){ getUserById(id: $id)${user_fields}}`, {id});
  return result.data.getUserById;
}

export function useUser(): [(User | null), () => void] {
  const [user, setUser] = useState<User | null>(null);

  const create = () => {
    create_user()
    .then(id => {
      return get_user(id);
    })
    .then(user => {
      setUser(user);
    })
    .catch(console.error);
  }

  return [user, create];
}
