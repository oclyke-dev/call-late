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
