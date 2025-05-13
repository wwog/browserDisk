import { FC, useEffect, useState } from 'react';
import type { ApplicationProps } from '../../services/appService/types';
//@ts-ignore
import css from './index.module.css';
import { If } from '../../components/Common/If';
import { callServiceWorker } from './callContentScript';
import { Button } from '../../components/Button';
import { getAllTables } from './utils';
import { TableRender } from './TableRender';
import { sqliteViewStore } from './store';

export const SqliteView: FC<ApplicationProps> = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { setTables } = sqliteViewStore();
  const connect = async () => {
    const res = await callServiceWorker('checkConnection');
    setIsConnected(res);
  };
  useEffect(() => {
    if (isConnected) {
      getAllTables().then((res) => {
        setTables(res);
      });
      return;
    } else {
      connect();
    }
  }, [isConnected]);

  return (
    <div className={css.container}>
      <If condition={isConnected}>
        <TableRender />
        <If.Else>
          <div>Connect to Sqlite View Step:</div>
          <div>1. Open Sqlite Database</div>
          <div>
            2. Master of the world need to set up `globalThis.$sql_view_exec`
            the exec function for real
          </div>
          <div>
            3.When the app is open, it communicates with the main world's
            'globalThis.$sql_view_exec ' to access the database
          </div>
          <div>
            Tips: The 'OpfsView' itself can export files and handle special
            headers as well as save them for viewing. Since the 'SAHPool' will
            hold the file handle, this is how the connection is made. In the
            future, direct opening will be supported. For non-handle forms,
            direct opening is better
          </div>
          <Button onClick={connect}>Connect</Button>
        </If.Else>
      </If>
    </div>
  );
};
