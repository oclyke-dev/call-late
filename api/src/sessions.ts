import {
  WebSocketServer,
  WebSocket,
} from 'ws';

import {
  ObjectId,
} from 'mongodb';

import {
  delete_room,
  remove_player_from_room,
} from '../../backend/src';

import {
  db,
} from '.';

type ExtendedWebSocket = WebSocket & {isAlive?: boolean, roomid?: string, userid?: string};
type Clients = ExtendedWebSocket[]
type Session = {clients: Clients}
type Sessions = { [key: string]: Session }
export const sessions: Sessions = {};
export const notify_room = async (room_id: string): Promise<void> => {
  const { clients } = sessions[room_id];
  clients.forEach((ws) => ws.send('refresh'));
};

const unregister = async (ws: ExtendedWebSocket) => {
  const tag = ws.roomid;
  console.log('attempting to unregister a client from session: ', tag);

  if (typeof tag !== 'undefined') {
    console.log('unregistering client from session: ', tag);
    const list = sessions[tag].clients;
    const index = list.indexOf(ws);
    if (index > -1) {
      list.splice(index, 1);

      // handle the disconnection from the game's perspective
      if(typeof ws.roomid !== 'undefined'){
        if(typeof ws.userid !== 'undefined'){
          await remove_player_from_room(db, new ObjectId(ws.roomid), new ObjectId(ws.userid));
        }
        await notify_room(ws.roomid);
      }

      if (list.length === 0) {
        console.warn('at this point the database should have the current session removed');

        if (typeof ws.roomid === 'undefined') {
          throw new Error('cannot remove session with undefined tag');
        }

        await delete_room(db, new ObjectId(ws.roomid))
      }
    } else {
      console.error('could not find the client in the list!');
    }
  } else {
    console.warn('client did not have a session tag');
  }
};

const register = async (ws: ExtendedWebSocket, roomid: string, userid: string) => {
  if(typeof roomid !== 'undefined'){
    ws.roomid = roomid; // associate tag with this client
  }
  if(typeof userid !== 'undefined'){
    ws.userid = userid;
  }

  if (typeof sessions[roomid] === 'undefined') {
    sessions[roomid] = {
      clients: [],
    };
  }
  const { clients } = sessions[roomid];
  if (!clients.includes(ws)) {
    clients.push(ws);
  }
};

export function start_wss(wss: WebSocketServer){
  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.on('pong', () => {
      // eslint-disable-next-line no-param-reassign
      ws.isAlive = true;
    });
    ws.on('close', () => { unregister(ws); });
    ws.on('message', (message) => {
      const args = JSON.parse(message.toString());
      const {roomid, userid} = args;
      console.log('client registering with: ', args);
      register(ws, roomid, userid);
    });
  });

  // heartbeat monitor
  const interval = setInterval(/* ping */() => {
    console.log('checking client connections');
    // console.error('todo: actually test broken connection detection!!!');

    (wss.clients as Set<ExtendedWebSocket>).forEach(/* each */ (ws) => {
      if (ws.isAlive === false) {
        console.log('client connection broken, terminating');
        unregister(ws);
        ws.terminate();
        return;
      }

      // eslint-disable-next-line no-param-reassign
      ws.isAlive = false;
      ws.ping();
    });
  }, 10000); /* 30000 */
}
