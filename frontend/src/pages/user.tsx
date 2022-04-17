import React from 'react';
import {
  useEffect,
  useState,
} from 'react';

import {
  useUser,
} from '../hooks';

import {
  fetch_gql,
} from '../utils';

export default () => {
  const [user, sign_in, sign_out] = useUser();
  const [signin, setSignin] = useState<{id: string, phone: string}>({id: '', phone: ''})

  return <>
    user page

    <div>
      <button
        onClick={async () => {
          const id = user._id;
          const phone = '+13037369483'; // format should include country code and only numeric values
          console.log('trying to add phone number to player...', id, phone);
          const response = await fetch_gql(`mutation ($id: ID!, $phone: String!){ addPhoneNumberToUser(id: $id, phone: $phone){ _id tag phone }}`, {id, phone});
          console.log(response);
        }}
      >
        add phone to player
      </button>
    </div>

    <div>
      <button
        onClick={async () => {
          sign_out();
        }}
      >
        sign out
      </button>
    </div>

    <div>
      <div>
        <input
          value={signin.id}
          onChange={(e) => {
            setSignin(prev => ({...prev, id: e.target.value}))
          }}
        />
        user id
      </div>

      <div>
        <input
          value={signin.phone}
          onChange={(e) => {
            setSignin(prev => ({...prev, phone: e.target.value}))
          }}
        />
        phone number
      </div>

      <button
        onClick={async () => {
          sign_in(signin.id, signin.phone);
        }}
      >
        sign in
      </button>
    </div>

  </>
}
