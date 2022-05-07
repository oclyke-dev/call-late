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
  useConnection,
  useRoom,
  useTabUser as useUser,
} from '../../hooks';

export const GameContext = React.createContext({room: undefined, user: undefined});

export default () => {
  const [connected, {connect, disconnect, associate}] = useConnection(handleConnectionEvent);
  const [room, join, check, leave] = useRoom();
  const [user, sign_in, sign_out] = useUser();
  const { tag } = useParams();

  // open connection + ask for room
  useEffect(() => {
    connect();
    join(tag);
    return function cleanup () {
      disconnect();
    }
  }, []);

  // make sure the server knows who we are
  useEffect(() => {
    // const userid = (user == null) 

    if(connected){
      const args: any = {};
      if(user !== null){
        args.userid = user._id.toString();
      }
      if(room !== null){
        args.roomid = room._id.toString();
      }
      associate(args);
    }
    check();
    
  }, [user, room])

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
