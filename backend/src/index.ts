// that's funny, there's nothing to run!
// (actually that's the point, see README.md)

export {
  Database,
  Room,
  User,
} from './types';

export {
  create_room,
  get_room,
  add_player_to_room,
} from './room';

export {
  create_user,
  get_user,
  get_users_public,
} from './user';

export {
  start_server,
  get_database,
  initialize_database,
} from './utils';
