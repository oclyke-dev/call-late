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
} from '../../hooks';

export default () => {
  const [room, join, leave] = useRoom();
  const { tag } = useParams();

  // make sure the room is joined
  useEffect(async () => {
    join(tag)
  }, []);

  if(!room){
    return <>loading</>
  } else {
    return <>
      <Link to='/'>call-late</Link>

      {/* <div>
        user info: 
        <pre>{(user !== null) && JSON.stringify(user, null, 2)}</pre>
      </div>
      <div>
        room info:
        <pre>{(room !== null) && JSON.stringify(room, null, 2)}</pre>
      </div> */}

      {room.phase === 0 && <Waiting room={room}/>}
      {room.phase === 1 && <Ordering room={room}/>}
      {room.phase === 2 && <Playing room={room}/>}
      {room.phase === 3 && <Finished room={room}/>}

    </>
  }
}
