import {
	default as React,
} from 'react';
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
  const [user, sign_in, sign_out, associate_phone] = useUser();
  const [signin, setSignin] = useState<{id: string, phone: string}>({id: '', phone: ''})

  return <>
    user page

    <div>
      user info: 
      <pre>{(user !== null) && JSON.stringify(user, null, 2)}</pre>
    </div>

    <div>
      <button
        onClick={async () => {
          await associate_phone('+13037369483');
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
