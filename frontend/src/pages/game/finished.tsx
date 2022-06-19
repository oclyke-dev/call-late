import {
	default as React,
} from 'react';
import {
  useContext,
} from 'react';

import Box from '@mui/material/Box';

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
    {room.winner && `the winner was ${room.winner}`}
    {!room.winner && 'there was no winner'}

    <button
      onClick={async () => {
        await fetch_gql(`mutation ($room_id: ID!){ resetRoom(room_id: $room_id, tag: "${room.tag}"){ _id tag phase players }}`, {room_id: room._id})
      }}
    >
      play again
    </button>

    <Box sx={{flexGrow: 1}}/>
  </>
}
