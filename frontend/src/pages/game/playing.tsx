import {
  default as React,
  useContext,
  useRef,
  useState,
} from 'react';

import {
  DragDropContext,
  Droppable,
  Draggable,
} from 'react-beautiful-dnd';

import {
  styled,
} from '@mui/material/styles';

import Box from '@mui/material/Box';

import {
  fetch_gql,
} from '../../utils';

import {
  GameContext,
} from './game';

import {
  NumberCard,
  Holder,
} from '../../components';

// ugh this is not a cute look, but the enum def from the backend can't 
// be used because of a disallowed MIME type whatever that means
const DISCARD = 0;
const RESERVE = 1;

export default () => {
  const {room, user} = useContext(GameContext);
  const [end_game, setEndGame] = useState<boolean>(false);

  const turnref = useRef(room.turn);
  turnref.current = room.turn;

  if(!user){
    return <>loading</>
  }

  if(!Object.keys(room.players).includes(user._id.toString())){
    return <>you are just a spectator of this game</>
  }

  async function pickUpReserve () {
    await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ startTurn(room_id: $room_id, user_id: $user_id, card_source: ${RESERVE}){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
  }

  async function pickUpDiscard () {
    await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ startTurn(room_id: $room_id, user_id: $user_id, card_source: ${DISCARD}){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
  }

  async function finishTurn (swap_index: number | null) {
    await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!, $swap_index: Int){ finishTurn(room_id: $room_id, user_id: $user_id, swap_index: $swap_index){ _id tag phase players }}`, {room_id: room._id, user_id: user._id, swap_index});
  }

  async function endGame () {
    await fetch_gql(`mutation ($room_id: ID!){ endGameInProgress(room_id: $room_id){ _id tag phase players }}`, {room_id: room._id});
  }

  const hand = room.hands[user._id.toString()];

  async function onDragStart (result) {
    const {source, destination, draggableId} = result;
  }

  async function onDragUpdate (result) {
    const {source, destination, draggableId} = result;
    const turn = turnref.current;
    if(turn.source === null){ 
      if(source.droppableId === 'reserve'){
        await pickUpReserve();
      }
    }
  
  }

  async function onDragEnd (result) {
    const {destination, source, draggableId} = result;
    const turn = turnref.current;
    // return imediately...
    // ...if card was dropped outside of valid locations
    if(!destination){
      return;
    }
    // ...or card was dropped in the same place it started
    if(
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // okay, let's handle logic:

    if(destination.droppableId === 'reserve'){
    }

    if(destination.droppableId === 'discard'){
      if(source.droppableId === 'reserve') {
        await finishTurn(null);
      }
    }

    if(destination.droppableId === 'holder'){
      if(destination.index < hand.length){

        // discard only gets 'chosen' when dropped into the holder
        if(source.droppableId === 'discard') {
          await pickUpDiscard();    
        }

        // reserve is expected to already be 'chosen' by the time it gets dropped
        await finishTurn(destination.index);
      }
    }
  }

  const discard_card = (room.discard_stack.length !== 0) ? room.discard_stack[0] : null;
  const userid = user._id.toString();
  const unknown_card = {
    flipped: true,
    number: null,
  }
  const reserve_card =  (room.turn.source !== RESERVE) ? unknown_card : {number: room.turn.card, flipped: false}

  return <>
    <DragDropContext
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
      onDragEnd={onDragEnd}
    >

      {/* expander (fills space to push player's hand to bottom of screen) */}
      <Box sx={{flexGrow: 1}}/>

      {/* player's hand */}
      <Droppable droppableId={'holder'}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <Holder
              sx={{
                // maxWidth: '160px',
              }}
            >
              {hand.map((value, idx) => {
                return <React.Fragment key={`hand.${idx}`}>
                  <Draggable draggableId={`${value}`} index={idx}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Box sx={{margin: '0.25rem'}}>
                          <NumberCard aspect={5} position={value/room.settings.total_cards} value={value}/>
                        </Box>
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

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-evenly',
        }}
      >

        
        {/* discard stack */}
        <Box
          style={{
            padding: '5px',
            width: '50%',
          }}
        >
          <Droppable droppableId={'discard'}>
            {(provided) => (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                }}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                  {(discard_card !== null) && <React.Fragment key={`discard.${0}`}>
                    <Draggable isDragDisabled={turnref.current.source === RESERVE} draggableId={`${discard_card}`} index={0}>
                      {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <NumberCard position={discard_card/room.settings.total_cards} value={discard_card}/>
                          </div>
                        )}
                    </Draggable>
                  </React.Fragment>}
                  {provided.placeholder}
              </div>
            )}
          </Droppable>
          <Box>
            discard
          </Box>
        </Box>

        {/* reserve cards */}
        <Box
          style={{
            padding: '5px',
            // backgroundColor: 'paleturquoise',
            // flexGrow: 1,

            width: '50%',
          }}
        >
          <Droppable droppableId={'reserve'}>
            {(provided) => (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                }}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {<React.Fragment key={`reserve.${0}`}>
                  <Draggable isDragDisabled={turnref.current.source === DISCARD} draggableId={'reserve-card'} index={0}>
                    {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <NumberCard value={reserve_card.number} position={reserve_card.number/room.settings.total_cards} flipped={reserve_card.flipped}/>
                        </div>
                      )}
                  </Draggable>
                </React.Fragment>}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <Box>
            reserve
          </Box>
        </Box>
      </div>

    </DragDropContext>
    
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
      {(room.turn.user === userid) ? <>
        <div>
          <button onClick={async () => { await pickUpDiscard(); await finishTurn(null); }}>
            skip turn
          </button>
        </div>
      </> : <><div></div></>}
        <div>
          <button onClick={async () => { setEndGame(true); }}>
            end game
          </button>
          {end_game && <>
            <div>are you sure?</div>
            <button onClick={() => { setEndGame(false); }}>
              no
            </button>
            <button onClick={async () => { await endGame(); }}>
              yes
            </button>
          </>}
        </div>

      </div>
      {room.turn.user !== userid && <>
      <div
        style={{
          backgroundColor: 'orangered',
          minHeight: '200px',
        }}
      >
        IT IS NOT YOUR TURN
      </div>
    </>}
  </>
}
