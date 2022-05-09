import React from 'react';
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
  User
} from '../../../../backend/src';

import {
  useConnection,
  useRoom,
  useTabUser as useUser,
} from '../../hooks';

import {
  fetch_gql,
} from '../../utils';

export type GameContextType = {room: Room, user: User};
export const GameContext = React.createContext<GameContextType>({room: undefined, user: undefined});

export default () => {
  const [connected, {connect, disconnect, associate}] = useConnection(handleConnectionEvent);
  const [room, join, check, leave] = useRoom();
  const [user, sign_in, sign_out] = useUser();
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
    check(); // check room for updates (signalled by this event on websocket)
  }

  if(!room){
    return <>loading</>
  } else {
    return <>
      <GameContext.Provider value={{room, user}}>

        {room.phase === 0 && <Waiting />}
        {room.phase === 1 && <Playing />}
        {room.phase === 2 && <Finished />}

      </GameContext.Provider>

    </>
  }
}
