import React from 'react';
import {
  useContext,
} from 'react';

import {
  GameContext,
} from './game';

import {
  fetch_gql
} from '../../utils';

export default () => {
  const {room, user} = useContext(GameContext);

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
