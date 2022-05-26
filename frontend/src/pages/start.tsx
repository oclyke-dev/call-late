import {
	default as React,
} from 'react';
import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  Outlet,
  useNavigate,
} from 'react-router-dom';

import {
  useRoom,
  useUser,
} from '../hooks';

import {
  fetch_gql,
} from '../utils';

export default () => {
  const navigate = useNavigate();
  const [tag, setTag] = useState<{value: string, exists: boolean}>({value: '', exists: false});

  return <>

    <div>
      <input 
        value={tag.value}
        onChange={async (e) => {
          const value = e.target.value;
          const result = await fetch_gql(`query { getRoomByTag(tag: "${value}"){_id}}`);
          setTag({value, exists: (result.data.getRoomByTag !== null)});
        }}
      />
      
      <button
        onClick={() => {
          navigate(`/${tag.value}`);
        }}
      >
        {(tag.exists) ? 'enter game' : 'create game'}
      </button>
    </div>
  </>
}
