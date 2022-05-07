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
  PlayerEntry,
} from './types';

export {
  create_room,
  get_room,
  get_room_by_tag,
  delete_room,
  add_player_to_room,
  remove_player_from_room,
  advance_room_phase,
  change_settings,
  reset_room,
} from './room';

export {
  create_user,
  get_user,
  get_users_public,
  increment_user_game_count,
  increment_user_win_count,
  associate_user_phone_number,
  verify_user,
} from './user';

export {
  start_server,
  get_database,
  initialize_database,
} from './utils';
