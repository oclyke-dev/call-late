import React from 'react';
import {
  useEffect,
  useState,
} from 'react';

import {
  useUser,
} from '../../hooks';

import {
  fetch_gql,
} from '../../utils';

import {
  Room,
} from '../../../../backend/src';

export default (props: {room: Room}) => {
  const [user] = useUser();
  const room = props.room;

  return <>
    ordering page


    <div>
      <button
        onClick={async () => {
          await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ addPlayerToOrder(room_id: $room_id, user_id: $user_id){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
        }}
      >
        get in order
      </button>
    </div>

  </>
}
