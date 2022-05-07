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
  Ordering,
  Playing,
  Finished,
} from '.';

import {
  useRoom,
  useUser,
} from '../../hooks';

export const GameContext = React.createContext({room: undefined, user: undefined});

export default () => {
  const [room, join, leave] = useRoom();
  const [user, sign_in, sign_out] = useUser();
  const { tag } = useParams();

  // make sure the room is joined
  useEffect(() => {
    join(tag)
  }, []);

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
