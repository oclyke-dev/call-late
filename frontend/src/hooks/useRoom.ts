import {
  useState,
  useRef,
} from 'react';

import {
  Room,
} from '../../../backend/src'

import {
  fetch_gql,
} from '../utils';

const ws_endpoint = 'ws://localhost:4001';

const room_fields = `{
  _id
  tag
  discard_stack
  hands
  players
  ordered
  phase
  winner
  turn {
    index
    user
    card
    source
  }
  settings {
    total_cards
    cards_per_hand
  } 
}`;

async function get_room(id: string): Promise<Room> {
  const result = await fetch_gql(`query ($id: ID!){ getRoomById(id: $id)${room_fields}}`, {id});
  return result.data.getRoomById;
}

async function get_room_by_tag(tag: string): Promise<Room> {
  const result = await fetch_gql(`query ($tag: String!){ getRoomByTag(tag: $tag)${room_fields}}`, {tag});
  return result.data.getRoomByTag;
}

async function create_room(tag: string) {
  const result = await fetch_gql(`mutation ($tag: String!){ createRoom(tag: $tag)}`, {tag});
  return result.data.createRoom;
}

export function useRoom(): [Room | null, (tag: string) => void, () => void] {
  const [room, setRoom] = useState<Room | null>(null);
  const id = useRef<string | null>(null);
  const socket = useRef<WebSocket | null>(null);


  // try to join a room by a given tag
  const join = (tag: string) => {
    if (socket.current !== null){
      console.error('already connecting...')
      return;
    }
    // Create WebSocket connection.
    const s = new WebSocket(ws_endpoint);

    // when the socket opens register with the server and get the applicable room
    s.addEventListener('open', async (event) => {

      get_room_by_tag(tag)
      .then((existing) => {
        if(existing === null){
          return create_room(tag);
        }else{
          return Promise.resolve(existing._id);
        }
      })
      .then(_id => {
        id.current = _id; // keep track of the id in case it is needed again
        s.send(_id);
        return get_room(_id);
      })
      .then(room => {
        setRoom(room);
      })
      .catch(console.error);
    });

    // register a listener for game state changes
    s.addEventListener('message', async (event) => {
      const room = await get_room(id.current);
      setRoom(room);
    });

    // cache the socket
    socket.current = s;
  }

  const leave = () => {
    // if (socket.current === null) {
    //   console.error('already disconnected');
    //   return;
    // }
    // socket.current.close();
    // socket.current = null;
  }

  return [room, join, leave];
}
