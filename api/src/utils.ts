import {
  gql,
} from 'apollo-server';

import fs = require('fs');
import path = require('path');

export function get_schema() {
  const data = fs.readFileSync(path.resolve(__dirname, 'schema.gql'), 'utf8');
  const schema = gql`${data}`;
  return schema;
}

export async function send_id_text(id: string, phone: string) {
  // @ts-ignore (until typescript supports the native fetch api in node)
  return fetch('https://identity-share-1948.twil.io/mytest', {
    method: 'POST',
    mode: 'cors',
    headers: {
      'X-Twilio-Signature': 'ZqQw9ne8UnBSZK9jDxlwLHpVAHc=',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Body: id,
      To: phone,
    }),
  });
}
