import React from 'react';
import {
  useEffect,
  useState,
} from 'react';

import {
  useUser,
} from '../../hooks';

import {
  Room,
} from '../../../../backend/src';

import {
  fetch_gql
} from '../../utils';

export default (props: {room: Room}) => {
  const room = props.room;

  console.log(room)

  return <>
    game finished!
    the winner was {room.winner}

    <button
      onClick={async () => {
        await fetch_gql(`mutation ($room_id: ID!){ resetRoom(room_id: $room_id, tag: "${room.tag}"){ _id tag phase players }}`, {room_id: room._id})
      }}
    >
      play again
    </button>
  </>
}
