import {
  useEffect,
  useState
} from "../../_snowpack/pkg/react.js";
import {
  useRoom,
  useUser
} from "../hooks/index.js";
import {
  fetch_gql
} from "../utils.js";
export default () => {
  const [room, join, leave] = useRoom();
  const [user, sign_in, sign_out] = useUser();
  const [signin, setSignin] = useState({id: "", phone: ""});
  const [settings, setSettings] = useState({total_cards: 0, cards_per_hand: 0});
  useEffect(async () => {
    join("testes tag");
  }, []);
  useEffect(() => {
    if (room && room.settings.total_cards !== settings.total_cards) {
      setSettings((prev) => ({...prev, total_cards: room.settings.total_cards}));
    }
    if (room && room.settings.cards_per_hand !== settings.cards_per_hand) {
      setSettings((prev) => ({...prev, cards_per_hand: room.settings.cards_per_hand}));
    }
  }, [room]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, "user info:", /* @__PURE__ */ React.createElement("pre", null, user !== null && JSON.stringify(user, null, 2))), /* @__PURE__ */ React.createElement("div", null, "room info:", /* @__PURE__ */ React.createElement("pre", null, room !== null && JSON.stringify(room, null, 2))), room && user && room.turn.user === user._id.toString() && /* @__PURE__ */ React.createElement("div", {
    style: {backgroundCOlor: "green"}
  }, room.turn.source === null && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", {
    disabled: room && user && room.turn.user !== user._id.toString(),
    onClick: async () => {
      console.warn("todo: somehow import the card source definitions from the backend codebase rather than relying on hard-coded values");
      await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ startTurn(room_id: $room_id, user_id: $user_id, card_source: ${0}){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
    }
  }, "pick up discard"), /* @__PURE__ */ React.createElement("button", {
    disabled: room && user && room.turn.user !== user._id.toString(),
    onClick: async () => {
      console.warn("todo: somehow import the card source definitions from the backend codebase rather than relying on hard-coded values");
      await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ startTurn(room_id: $room_id, user_id: $user_id, card_source: ${1}){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
    }
  }, "pick up new card")), room.turn.source !== null && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "swap card with:"), room.hands[user._id.toString()].map((value, idx) => {
    return /* @__PURE__ */ React.createElement("button", {
      key: `swap_button.${idx}`,
      onClick: async () => {
        await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ finishTurn(room_id: $room_id, user_id: $user_id, swap_index: ${idx}){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
      }
    }, `${value} (${idx})`);
  }), /* @__PURE__ */ React.createElement("button", {
    onClick: async () => {
      await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ finishTurn(room_id: $room_id, user_id: $user_id, swap_index: ${null}){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
    }
  }, "just discard"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", {
    onClick: () => {
      localStorage.clear();
    }
  }, "clear local storage")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", {
    onClick: async () => {
      console.log("clicked", room);
      await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ addPlayerToRoom(room_id: $room_id, user_id: $user_id){ players }}`, {room_id: room._id, user_id: user._id});
    }
  }, "add user to game")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", {
    onClick: async () => {
      await fetch_gql(`mutation ($room_id: ID!){ startGame(room_id: $room_id){ _id tag phase players }}`, {room_id: room._id});
    }
  }, "start game")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", {
    onClick: async () => {
      await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ addPlayerToOrder(room_id: $room_id, user_id: $user_id){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
    }
  }, "get in order"))), /* @__PURE__ */ React.createElement("div", {
    style: {backgroundColor: "gray"}
  }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", {
    onClick: async () => {
      const id = user._id;
      const phone = "+13037369483";
      console.log("trying to add phone number to player...", id, phone);
      const response = await fetch_gql(`mutation ($id: ID!, $phone: String!){ addPhoneNumberToUser(id: $id, phone: $phone){ _id tag phone }}`, {id, phone});
      console.log(response);
    }
  }, "add phone to player")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", {
    onClick: async () => {
      sign_out();
    }
  }, "sign out")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("input", {
    value: signin.id,
    onChange: (e) => {
      setSignin((prev) => ({...prev, id: e.target.value}));
    }
  }), "user id"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("input", {
    value: signin.phone,
    onChange: (e) => {
      setSignin((prev) => ({...prev, phone: e.target.value}));
    }
  }), "phone number"), /* @__PURE__ */ React.createElement("button", {
    onClick: async () => {
      sign_in(signin.id, signin.phone);
    }
  }, "sign in")), room && room.phase === 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("input", {
    value: settings.total_cards,
    onChange: (e) => {
      if (e.target.value === "") {
        setSettings((prev) => ({...prev, total_cards: ""}));
      } else {
        setSettings((prev) => ({...prev, total_cards: parseInt(e.target.value)}));
      }
    }
  }), "total cards"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("input", {
    value: settings.cards_per_hand,
    onChange: (e) => {
      if (e.target.value === "") {
        setSettings((prev) => ({...prev, cards_per_hand: ""}));
      } else {
        setSettings((prev) => ({...prev, cards_per_hand: parseInt(e.target.value)}));
      }
    }
  }), "cards per hand"), /* @__PURE__ */ React.createElement("button", {
    onClick: async () => {
      const update = {};
      if (settings.cards_per_hand !== "") {
        update.cards_per_hand = settings.cards_per_hand;
      }
      if (settings.total_cards !== "") {
        update.total_cards = settings.total_cards;
      }
      await fetch_gql(`mutation ($room_id: ID!){ changeCardsPerHand(room_id: $room_id, cards_per_hand: ${settings.cards_per_hand}){ _id tag phase players }}`, {room_id: room._id});
      await fetch_gql(`mutation ($room_id: ID!){ changeTotalCards(room_id: $room_id, total_cards: ${settings.total_cards}){ _id tag phase players }}`, {room_id: room._id});
    }
  }, "apply settings"))));
};
