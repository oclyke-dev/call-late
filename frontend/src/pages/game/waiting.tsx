import React from 'react';
import {
  useEffect,
  useState,
  useContext,
} from 'react';

import {
  DragDropContext,
  Droppable,
  Draggable,
} from 'react-beautiful-dnd';

import {
  fetch_gql,
} from '../../utils';

import {
  PlayerCard,
  Holder,
  Sluice,
} from '../../components';

import {
  GameContext,
} from './game';

export default () => {
  const {room, user} = useContext(GameContext);
  
  const [settings, setSettings] = useState<{total_cards: string | number, cards_per_hand: string | number}>({total_cards: 0, cards_per_hand: 0})

  async function onDragEnd (result) {
    const {destination, source, draggableId} = result;
    
    if(!destination){
      return;
    }

    if(
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    const ordered = [...room.ordered];
    ordered.splice(source.index, 1);
    ordered.splice(destination.index, 0, draggableId);

    await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!, $ordered: [ID!]!){ setPlayerOrders(room_id: $room_id, user_id: $user_id, ordered: $ordered){ _id tag phase players }}`, {room_id: room._id, user_id: user._id, ordered});
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

  if(user && !Object.keys(room.players).includes(user._id.toString())){
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
                {room.ordered.map((player, idx) => {
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
