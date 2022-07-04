import {
	default as React,
} from 'react';
import {
  useContext,
} from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import {
  GameContext,
  Info,
} from './game';

import {
  fetch_gql
} from '../../utils';

function Celebrate () {
  return <>
    <Box>
      <Typography color='secondary' variant='h4'>
        🎉
      </Typography>
    </Box>
  </>
}

export default () => {
  const {room, user, players} = useContext(GameContext);

  console.log(room)

  const winnerinfo = players[Object.keys(players).filter(i => (room.winner !== null && typeof i !== 'undefined' && i === room.winner))[0]];

  return <>

    {room.winner && <>
      <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>

        {/* <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}> */}

          <Celebrate/>
          <Box>
            <Info
              stats
              info={winnerinfo}
            />
          </Box>
          <Celebrate/>

        {/* </Box> */}
      </Box>
    </>}


    <Box sx={{margin: '1rem', width: '100%', display: 'flex', 'justifyContent': 'space-around'}}>
      <Button
        sx={{width: '100%'}}
        variant='contained'
        color='secondary'
        onClick={async () => {
          await fetch_gql(`mutation ($room_id: ID!){ resetRoom(room_id: $room_id, tag: "${room.tag}"){ _id tag phase players }}`, {room_id: room._id})
        }}
      >
        play again
      </Button>
    </Box>

    <Box sx={{flexGrow: 1}}/>
  </>
}
