import {
	default as React,
} from 'react';
import {
  useEffect,
  useContext,
  useState,
  useRef,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import { SliderPicker } from 'react-color';

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
  useUser,
  usePlayers,
} from '../../hooks';

import {
  fetch_gql,
} from '../../utils';

import {
  AppContext,
} from '../../app';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';

import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

async function set_user_tag(room_id: string, user_id: string, tag: string): Promise<User | null> {
  const result = await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!, $tag: String!){ setUserTag(room_id: $room_id, user_id: $user_id, tag: $tag){_id}}`, {room_id, user_id, tag});
  return result.data.setUserTag;
}

async function set_user_color(room_id: string, user_id: string, color: string): Promise<User | null> {
  const result = await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!, $color: String!){ setUserColor(room_id: $room_id, user_id: $user_id, color: $color){_id}}`, {room_id, user_id, color});
  return result.data.setUserColor;
}

type UserPublicMap = {[key: string]: UserPublic}

export type GameContextType = {room: Room, user: User, players: UserPublicMap};
export const GameContext = React.createContext<GameContextType>({room: undefined, user: undefined, players: {}});
export {
  Info,
}

export default () => {
  const {onTagChange} = useContext(AppContext);

  const [connected, {connect, disconnect, associate}] = useConnection(handleConnectionEvent);
  const [room, join, check, leave] = useRoom();
  const [user, {sign_in, sign_out, associate_phone, clear_storage}] = useUser();
  const [players, sync_players] = usePlayers();
  const { tag } = useParams();

  // open connection + ask for room
  const roomid = (room === null) ? undefined : room._id.toString();
  const userid = (user === null) ? undefined : user._id.toString();
  useEffect(() => {
    connect().catch(console.error);
    join(tag)
    .then(async r => {
      associate({roomid: r._id.toString(), userid});
      sync_players(r.ordered);
      onTagChange(r.tag);
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

  const userid = user._id.toString();
  const self = players[Object.keys(players).filter(i => (user !== null && typeof i !== 'undefined' && i === userid))[0]];
  const others = Object.keys(players).filter(i => (user !== null && typeof i !== 'undefined' && i !== userid)).map(id => players[id]);

  const idsref = useRef<{u?: string, r?: string}>({});
  idsref.current = {u: user._id.toString(), r: room._id.toString()}

  return <>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Box>
        {typeof self !== 'undefined' && <>
          <Info
            editable
            stats
            info={self}
            onChange={async (tag, color) => {
              await Promise.all([set_user_color(idsref.current.r, idsref.current.u, color), set_user_tag(idsref.current.r, idsref.current.u, tag), ]);
            }}
          />
        </>}
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

type EditResponder = (tag: string, color: string) => void;

function Info (props: {info: User | UserPublic, stats?: boolean, editable?: boolean, onChange?: (tag: string, color: string) => void}) {
  const info = props.info;
  const stats = (typeof props.stats !== 'undefined') ? props.stats : false;
  const editable = (typeof props.editable !== 'undefined') ? props.editable : false;

  const [editing, setEditing] = useState<boolean>(false);
  const [edit_tag, setEditTag] = useState<string>('')
  const [edit_color, setEditColor] = useState<string>(info.color);

  const responder = useRef<EditResponder>(undefined);
  responder.current = props.onChange;


  function notify(tag: string, color: string) {
    if (typeof responder.current !== 'undefined') {
      responder.current(tag, color);
    }
  }

  function startEditing () {
    setEditTag(info.tag);
    setEditColor(info.color);
    setEditing(true);
  }

  function stopEditing () {
    setEditing(false);
    notify(edit_tag, edit_color);
  }

  return <>
    <Paper
      sx={{
        margin: 1,
        minWidth: (editable) ? '160px' : '120px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'start',
          minHeight: 40,
        }}
      >

          {/* user's color swatch */}
          <Box sx={{ minWidth: '30px', backgroundColor: (editing) ? edit_color : info.color}}/>

          {/* user info in a column */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              marginLeft: 1,
            }}
          >

            {/* user's name */}
            <Box>
              {editable && editing && <>
                <input
                  value={edit_tag}
                  onChange={(e) => {
                    setEditTag(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter'){
                      stopEditing();
                    }
                  }}
                />
              </>}

              {!editing && <>
                <span>
                {info.tag}
                </span>
              </>}
            </Box>

            {/* user's stats */}
            {stats && <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <span style={{color: 'green'}}>{info.total_wins}</span>
                  /
                  <span style={{}}>{info.total_games}</span>
                  
                  
                </Box>
              </Box>
            </>}
            

          </Box>

          {/* toggle for editing */}
          {editable && <>
            <Vcenter>
              <IconButton color='secondary' onClick={(editing) ? stopEditing : startEditing }>
                {editing ? <CheckIcon/> : <SettingsIcon/>}
              </IconButton>
            </Vcenter>
          </>}

        </Box>

        {editing && <>
          <Box
            sx={{
              margin: 1,
            }}
          >
            <SliderPicker
              color={edit_color}
              onChange={(color) => {
                setEditColor(color.hex);
              }}
              onComplete={(color) => {
                setEditColor(color.hex);
              }}
            />
          </Box>
        </>}

    </Paper>
  </>
}

function Vcenter (props: any) {
  return <>
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        fledDirection: 'column',
        justifyContent: 'space-around',
      }}
    >
      {props.children}
    </Box>
  </>
}
