import {
	default as React,
} from 'react';
import {
  useEffect,
  useContext,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import {
  Waiting,
  Playing,
  Finished,
} from '.';

import {
  Room,
  User,
  UserPublic,
} from '../../../../backend/src';

import {
  useConnection,
  useRoom,
  useTabUser as useUser,
  usePlayers,
} from '../../hooks';

import {
  fetch_gql,
} from '../../utils';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

export type GameContextType = {room: Room, user: User, players: UserPublic[]};
export const GameContext = React.createContext<GameContextType>({room: undefined, user: undefined, players: []});

export default () => {
  const [connected, {connect, disconnect, associate}] = useConnection(handleConnectionEvent);
  const [room, join, check, leave] = useRoom();
  const [user, sign_in, sign_out] = useUser();
  const [players, sync_players] = usePlayers();
  const { tag } = useParams();

  // open connection + ask for room
  const roomid = (room === null) ? undefined : room._id.toString();
  const userid = (user === null) ? undefined : user._id.toString();
  useEffect(() => {
    connect().catch(console.error);
    join(tag)
    .then(r => {
      associate({roomid: r._id.toString(), userid});
      sync_players(r.ordered);
    })
    .catch(console.error);
    return function cleanup () {
      disconnect();
    }
  }, [roomid, userid]);

  // handle signals from the connection
  function handleConnectionEvent (event) {
    check() // check room for updates (signalled by this event on websocket)
    .then(r => {
      sync_players(r.ordered);
    })
    .catch(console.error);
  }

  if(!room){
    return <>loading</>
  } else {
    return <>
      <GameContext.Provider value={{room, user, players}}>

        <Players/>

        {room.phase === 0 && <Waiting />}
        {room.phase === 1 && <Playing />}
        {room.phase === 2 && <Finished />}

      </GameContext.Provider>

      {/* <pre>
        {JSON.stringify(user, null, 2)}
      </pre> */}

      {/* <pre>
        {JSON.stringify(room, null, 2)}
      </pre> */}

    </>
  }
}

function Players () {
  const {room, user, players} = useContext(GameContext);
  const others = players.filter(i => (typeof i !== 'undefined' && i._id !== user._id));

  function Info (props: {info: User | UserPublic}) {
    const info = props.info;
    return <>
      <Paper
        sx={{
          height: '50px',
          margin: 1,
          width: '300px',
        }}
      >
        tag: {info.tag}
        color: {info.color}
        wins: {info.total_wins}
        games: {info.total_games}
      </Paper>
    </>
  }

  return <>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',

      }}
    >
      <Box>
        {user !== null && <Info info={user}/>}
      </Box>

      <Box
        sx={{
          // overflow: 'auto',
          overflow: 'scroll',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'row',
          minHeight: 'min-content',
        }}
      >
        {others.map(info => {
          // return <React.Fragment key={`player.${info._id}.info`}>
          return <Box key={`player.${info._id}.info`}>
            <Info info={info}/>
          </Box>
          // </React.Fragment>
        })}
      </Box>

    </Box>
  </>
}
