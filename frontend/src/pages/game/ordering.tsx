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

  const in_order = (user && room.ordered.includes(user._id.toString()))

  return <>
    ordering page

    <div>
      players in order:
      {room.ordered.map(id => id.toString()).map((id, idx) => {
        return <React.Fragment key={`player.${id}`}>
          <div>
            {id}
          </div>
        </React.Fragment>
      })}
    </div>

    {!in_order && <div>
      <button
        onClick={async () => {
          await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ addPlayerToOrder(room_id: $room_id, user_id: $user_id){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
        }}
      >
        get in order
      </button>
    </div>}

    {in_order && <div>
      <button
        onClick={async () => {
          await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ removePlayerFromOrder(room_id: $room_id, user_id: $user_id){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
        }}
      >
        get out of order
      </button>
    </div>}

  </>
}
