import React from 'react';
import {
  useState,
  useRef,
  useEffect,
} from 'react';

import {
  User,
} from '../../../backend/src'

import {
  fetch_gql,
} from '../utils';

const user_fields = `{
  _id
  tag
  color
  total_games
  total_wins
  phone
}`;

const user_id_key = 'user_id';

async function create_user(): Promise<string> {
  const result = await fetch_gql(`mutation { createUser }`);
  return result.data.createUser;
}

async function get_user(id: string): Promise<User | null> {
  const result = await fetch_gql(`query ($id: ID!){ getUserById(id: $id)${user_fields}}`, {id});
  return result.data.getUserById;
}

async function verify_user(id: string, phone: string): Promise<User | null> {
  const result = await fetch_gql(`query ($id: ID!, $phone: String!){ verifyUser(id: $id, phone: $phone)${user_fields}}`, {id, phone});
  return result.data.verifyUser;
}

type PersistantStorage = {
  store: (val: string) => void,
  load: () => string | null,
  clear: () => void,
}



export function useUserCore(persistance: PersistantStorage): [(User | null), (id: string, phone: string) => void, () => void, (phone: string) => void] {
  const [nonce, setNonce] = useState(new Object());
  const [user, setUser] = useState<User | null>(null);

  // get the initial user either from local storage id 
  // or by creating a new user within the database
  useEffect(() => {
    const localid = persistance.load();
    if(!localid){
      create_user()
      .then(id => {
        persistance.store(id);
        return get_user(id);
      })
      .then(user => {
        console.log('got new user', user);
        setUser(user);
      })
      .catch(console.error);
    } else {
      get_user(localid)
      .then(user => {
        if(user === null){
          persistance.clear(); // try to remedy this...
          setNonce(new Object());
          return Promise.reject(`user with id: '${localid}' not found in database`);
        }
        setUser(user);
      })
      .catch(console.error);
    }
  }, [nonce]);

  function get () {

  }

  function sign_in(id: string, phone: string) {
    // to sign in the database must confirm that the 
    // supplied phone number matches the desired user
    verify_user(id, phone)
    .then(user => {
      if(user === null){
        return Promise.reject('invalid credentials');
      }
      setUser(user);
      persistance.store(id);
    })
    .catch(console.error);
  }

  function sign_out() {
    // an id in localstorage authorizes use of that user
    // (yeah, not super secure lol but its a silly game)
    // therefore removing that id signs out the user
    localStorage.removeItem(user_id_key);
    setUser(null);
  }

  async function associate_phone(phone: string) {
    // const phone = '+13037369483'; // format should include country code and only numeric values
    await fetch_gql(`mutation ($id: ID!, $phone: String!){ addPhoneNumberToUser(id: $id, phone: $phone){ _id tag phone }}`, {id: user._id, phone});
  }

  return [user, sign_in, sign_out, associate_phone];
}

// create a useUser hook that uses localstorage to maintain user between tabs
export function useUser() {
  const persistent_local_storage: PersistantStorage = {
    store: (val: string) => { localStorage.setItem(user_id_key, val); },
    load: () => { return localStorage.getItem(user_id_key); },
    clear: () => { localStorage.clear(); },
  }

  return useUserCore(persistent_local_storage);
}

// create a useUser hook that uses a ref so that each application has its unique value
export function useTabUser() {
  const idref = useRef(null);
  const persistant_ref_storage: PersistantStorage = {
    store: (val: string) => { idref.current = val; },
    load: () => { return idref.current; },
    clear: () => { idref.current = null; },
  }

  return useUserCore(persistant_ref_storage);
}
