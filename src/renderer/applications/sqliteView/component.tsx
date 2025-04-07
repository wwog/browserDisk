import { FC, useEffect, useRef, useState } from 'react';
import type { ApplicationProps } from '../../services/appService/types';
//@ts-ignore
import css from './index.module.css';
import { If } from '../../components/Common/If';
import { callContentScriptSqlMethod } from './callContentScript';

export const SqliteView: FC<ApplicationProps> = (props) => {
  const [isConnected, setIsConnected] = useState(false);
  const checkConnectionTimer = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const clearTimer = () => {
    if (checkConnectionTimer.current) {
      clearInterval(checkConnectionTimer.current);
      checkConnectionTimer.current = null;
    }
  };
  useEffect(() => {
    checkConnectionTimer.current = setInterval(async () => {
      const connectionStatus = await callContentScriptSqlMethod(
        'checkConnection'
      );
      console.log('checkConnection', connectionStatus);
      setIsConnected(connectionStatus);
    }, 1000);
    return () => {
      clearTimer();
    };
  }, []);
  useEffect(() => {
    if (isConnected) {
      clearTimer();
      console.log('Connected to Sqlite View');
    }
  }, [isConnected]);


  return (
    <div className={css.container}>
      <If condition={isConnected}>
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
        </If.Else>
      </If>
    </div>
  );
};
