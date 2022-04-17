import {
  useState,
  useEffect
} from "../../_snowpack/pkg/react.js";
import {
  fetch_gql
} from "../utils.js";
const user_fields = `{
  _id
  tag
  color
  total_games
  total_wins
}`;
const user_id_key = "user_id";
async function create_user() {
  const result = await fetch_gql(`mutation { createUser }`);
  return result.data.createUser;
}
async function get_user(id) {
  const result = await fetch_gql(`query ($id: ID!){ getUserById(id: $id)${user_fields}}`, {id});
  return result.data.getUserById;
}
async function verify_user(id, phone) {
  const result = await fetch_gql(`query ($id: ID!, $phone: String!){ verifyUser(id: $id, phone: $phone)${user_fields}}`, {id, phone});
  return result.data.verifyUser;
}
export function useUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const localid = localStorage.getItem(user_id_key);
    if (!localid) {
      create_user().then((id) => {
        localStorage.setItem(user_id_key, id);
        return get_user(id);
      }).then((user2) => {
        console.log("got new user", user2);
        setUser(user2);
      }).catch(console.error);
    } else {
      get_user(localid).then((user2) => {
        if (user2 === null) {
          return Promise.reject(`user with id: '${localid}' not found in database`);
        }
        setUser(user2);
      }).catch(console.error);
    }
  }, []);
  function sign_in(id, phone) {
    verify_user(id, phone).then((user2) => {
      if (user2 === null) {
        return Promise.reject("invalid credentials");
      }
      setUser(user2);
      localStorage.setItem(user_id_key, id);
    }).catch(console.error);
  }
  function sign_out() {
    localStorage.removeItem(user_id_key);
  }
  return [user, sign_in, sign_out];
}
