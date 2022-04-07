import React from 'react';
import {
  useEffect,
} from 'react';

import {
  useRoom,
  useUser,
} from './hooks';

import {
  fetch_gql,
} from './utils';

export default () => {
  const [room, join, leave] = useRoom();
  const [user, create_user] = useUser();

  useEffect(async () => {
    console.log('here I am baby');
    join('testes tag')


  }, []);

  return <>
    hello world
    <div>
      user info: 
      <pre>{(user !== null) && JSON.stringify(user, null, 2)}</pre>
    </div>
    <div>
      room info:
      <pre>{(room !== null) && JSON.stringify(room, null, 2)}</pre>
    </div>


    <button
      onClick={() => {
        create_user();
      }}
    >
      create user
    </button>

    <button
      onClick={async () => {
        console.log('clicked', room);
        await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ addPlayerToRoom(room_id: $room_id, user_id: $user_id){ players }}`, {room_id: room._id, user_id: user._id});
      }}
    >
      add user to game
    </button>
  </>
}
