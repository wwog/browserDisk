import type { FC } from 'react';
import { callContentScriptOpfs } from '../../../../services/fileService/helper';
import { DropWrapper } from '../../../../components/DropWrapper';

export const OpfsViewer: FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      123
      <DropWrapper
        style={{
          width: '100%',
          height: '100%',
        }}
        onDrop={(files) => {
          console.log('Files dropped:', files);
        }}
      >
        <button
          onClick={() => {
            callContentScriptOpfs('readDir', '/').then((res) => {
              console.log('res', res);
            });
          }}
        >
          SendMessage
        </button>
        <button
          onClick={() => {
            const name = prompt('Enter directory name:');
            if (name) {
              callContentScriptOpfs('mkdir', name).then(() => {
                console.log(`Directory ${name} created.`);
              });
            }
          }}
        >
          mkdir
        </button>
        <button
          onClick={() => {
            //打开文件选择器
            chrome.devtools.inspectedWindow.eval('');
          }}
        >
          test send handle
        </button>
      </DropWrapper>
    </div>
  );
};
