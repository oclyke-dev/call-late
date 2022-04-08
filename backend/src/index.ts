// that's funny, there's nothing to run!
// (actually that's the point, see README.md)

export {
  Database,
  Room,
  User,
  GamePhase,
  Hand,
  Turn,
  CardSource,
  Settings,
} from './types';

export {
  create_room,
  get_room,
  get_room_by_tag,
  delete_room,
  add_player_to_room,
  advance_room_phase,
  add_user_to_order,
  remove_user_from_order,
} from './room';

export {
  create_user,
  get_user,
  get_users_public,
  increment_user_game_count,
  increment_user_win_count,
  associate_user_phone_number,
} from './user';

export {
  start_server,
  get_database,
  initialize_database,
} from './utils';
