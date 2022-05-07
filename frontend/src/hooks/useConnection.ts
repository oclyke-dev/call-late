import {
  useState,
  useRef,
} from 'react';

const ws_endpoint = 'ws://localhost:4001';

type ConnectionOps = {
  connect: () => void,
  disconnect: () => void,
  associate: (opts?: {roomid?: string, userid?: string}) => void,
}

export function useConnection(onEvent): [boolean, ConnectionOps] {
  const [connected, setConnected] = useState<boolean>(false);
  const socket = useRef<WebSocket | null>(null);

  // try to join a room by a given tag
  const connect = () => {
    if (socket.current !== null){
      console.error('already connecting...')
      return;
    }
    // Create WebSocket connection.
    const s = new WebSocket(ws_endpoint);

    // when the socket opens register with the server and get the applicable room
    s.addEventListener('open', async (event) => {
      setConnected(true);
    });

    // handle when the socket closes
    s.addEventListener('close', async (event) => {
      setConnected(false);
    })

    // register a listener for game state changes
    s.addEventListener('message', async (event) => {
      if(typeof onEvent !== 'undefined') {
        onEvent(event);
      }
    });

    // cache the socket
    socket.current = s;
  }

  const disconnect = () => {
    // if (socket.current === null) {
    //   console.error('already disconnected');
    //   return;
    // }
    // socket.current.close();
    // socket.current = null;
  }

  function associate (opts) {
    if(socket.current === null) {
      throw new Error('socket disconnected');
    }
    socket.current.send(JSON.stringify(opts));
  }

  return [connected, {connect, disconnect, associate}];
}
