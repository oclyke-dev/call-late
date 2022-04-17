import {
  useState,
  useRef
} from "../../_snowpack/pkg/react.js";
import {
  fetch_gql
} from "../utils.js";
const ws_endpoint = "ws://localhost:4001";
const room_fields = `{
  _id
  tag
  discard_stack
  hands
  players
  ordered
  phase
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
async function get_room(id) {
  const result = await fetch_gql(`query ($id: ID!){ getRoomById(id: $id)${room_fields}}`, {id});
  return result.data.getRoomById;
}
async function get_room_by_tag(tag) {
  const result = await fetch_gql(`query ($tag: String!){ getRoomByTag(tag: $tag)${room_fields}}`, {tag});
  return result.data.getRoomByTag;
}
async function create_room(tag) {
  const result = await fetch_gql(`mutation ($tag: String!){ createRoom(tag: $tag)}`, {tag});
  return result.data.createRoom;
}
export function useRoom() {
  const [room, setRoom] = useState(null);
  const id = useRef(null);
  const socket = useRef(null);
  const join = (tag) => {
    if (socket.current !== null) {
      console.error("already connecting...");
      return;
    }
    const s = new WebSocket(ws_endpoint);
    s.addEventListener("open", async (event) => {
      get_room_by_tag(tag).then((existing) => {
        if (existing === null) {
          return create_room(tag);
        } else {
          return Promise.resolve(existing._id);
        }
      }).then((_id) => {
        id.current = _id;
        s.send(_id);
        return get_room(_id);
      }).then((room2) => {
        setRoom(room2);
      }).catch(console.error);
    });
    s.addEventListener("message", async (event) => {
      const room2 = await get_room(id.current);
      setRoom(room2);
    });
    socket.current = s;
  };
  const leave = () => {
  };
  return [room, join, leave];
}
