import React from 'react';
import {
  useEffect,
  useState,
} from 'react';

import {
  DragDropContext,
  Droppable,
  Draggable,

  DraggableId,
} from 'react-beautiful-dnd';

import {
  useParams,
} from 'react-router-dom';

import {
  fetch_gql,
} from '../../utils';

import {
  useRoom,
  useUser,
} from '../../hooks';

import {
  PlayerCard,
  Holder,
  Sluice,
} from '../../components';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import {
  Room,
} from '../../../../backend/src';

export default (props: {room: Room}) => {
  const [settings, setSettings] = useState<{total_cards: string | number, cards_per_hand: string | number}>({total_cards: 0, cards_per_hand: 0})
  const [user, sign_in, sign_out] = useUser();
  const room = props.room;

  function onDragEnd (result) {
    console.log(result)
  }

  // sync settings with game state
  useEffect(() => {
    if(room && room.settings.total_cards !== settings.total_cards){
      setSettings(prev => ({...prev, total_cards: room.settings.total_cards}));
    }
    if(room && room.settings.cards_per_hand !== settings.cards_per_hand){
      setSettings(prev => ({...prev, cards_per_hand: room.settings.cards_per_hand}));
    }
  }, [room]);

  if(user && !room.players.includes(user._id.toString())){
    fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ addPlayerToRoom(room_id: $room_id, user_id: $user_id){ players }}`, {room_id: room._id, user_id: user._id});
  }

  return <>
    <Sluice>

      <DragDropContext
        onDragStart={undefined}
        onDragUpdate={undefined}
        onDragEnd={onDragEnd}
      >

        <Droppable droppableId={'holder'}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <Holder>
                {room.players.map((player, idx) => {
                  return <React.Fragment key={`player.${player}`}>
                    <Draggable draggableId={player} index={idx}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <PlayerCard player={player}/>
                        </div>
                      )}
                    </Draggable>
                  </React.Fragment>
                })}
                {provided.placeholder}
              </Holder>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div>
        <button
          onClick={async () => {
            await fetch_gql(`mutation ($room_id: ID!){ startGame(room_id: $room_id){ _id tag phase players }}`, {room_id: room._id});
          }}
        >
          start game
        </button>
      </div>

    </Sluice>
  </>
}
