import {
	default as React,
} from 'react';
import {
  useEffect,
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

export type GameContextType = {room: Room, user: User, players: {[key: string]: UserPublic}};
export const GameContext = React.createContext<GameContextType>({room: undefined, user: undefined, players: {}});

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
    connect();
    join(tag)
    .then(r => {
      associate({roomid: r._id.toString(), userid});
    })
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
