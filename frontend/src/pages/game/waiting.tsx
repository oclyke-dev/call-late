import {
	default as React,
} from 'react';
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

import Box from '@mui/material/Box';
import Typeography from '@mui/material/Typography';

import {
  fetch_gql,
} from '../../utils';

import {
  Card,
  Holder,
} from '../../components';

import {
  GameContext,
} from './game';

export default () => {
  const {room, user, players} = useContext(GameContext);
  
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

  // auto-add player to game
  const userid = (user !== null) ? user._id.toString() : null;
  if(userid && !room.ordered.includes(userid)) {
    async function addPlayerToGame() {
      await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ addPlayerToRoom(room_id: $room_id, user_id: $user_id){ players }}`, {room_id: room._id, user_id: userid});
    }
    addPlayerToGame();
  }

  return <>
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
                  let info = players[player];
                  let name = player;
                  let color = 'none';
                  if (typeof info !== 'undefined') {
                    name = info.tag;
                    color = info.color;
                  }

                  return <React.Fragment key={`player.${player}`}>
                    <Draggable draggableId={player} index={idx}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >

                          <Card sx={{margin: '0.25rem', aspectRatio: '10/1'}}>
                            {/* horizontal */}
                            <Box sx={{height: '100%', display: 'flex', flexDirection: 'row'}}>
                              {/* color swatch */}
                              <Box sx={{minWidth: '30px', height: '100%', backgroundColor: color, marginRight: '0.5rem'}}></Box>

                              {/* vertical align */}
                              <Box sx={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
                                <Box>
                                  <Typeography variant='h5'>{name}</Typeography>
                                </Box>
                              </Box>

                              {/* space sucker */}
                              <Box sx={{display: 'flex', flexGrow: 1}}/>
                              
                            </Box>
                          </Card>
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
  </>
}
