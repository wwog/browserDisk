import {
  ApplicationType,
  type Application,
} from '../services/appService/types';
import { SqliteView } from './sqliteView/component';

export const sqliteViewApplication: Application = {
  id: 'sqliteView',
  name: 'SQLite View',
  icon: '📝',
  component: SqliteView,
  singleton: true,
  type: ApplicationType.Standalone,
};
