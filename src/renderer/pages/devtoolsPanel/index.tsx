import { FC } from 'react';
import { Allotment } from 'allotment';
import { Toaster } from 'react-hot-toast';
import { ApplicationService } from '../../services/appService/mod';
import { monacoApplication } from '../../applications/monaco';
import { OpfsViewer } from './components/OpfsViewer';
import { ApplicationContainer } from './components/Application/container';
import { FileService } from '../../services/fileService/mod';
import { sqliteViewApplication } from '../../applications/sqliteView';

import 'allotment/dist/style.css';

const appService = ApplicationService.getInstance();
appService.registerApplication(monacoApplication);
appService.registerApplication(sqliteViewApplication);

const swConnection = chrome.runtime.connect({
  name: 'devtoolsPanel',
});

swConnection.onMessage.addListener((message) => {
  if (message.type === 'tabs_onUpdate') {
    FileService.getInstance().jumpRelative('/');
  }
});

export const DevtoolsPanelPage: FC = () => {
  return (
    <Allotment>
      <Allotment.Pane snap minSize={160} maxSize={720} preferredSize={410}>
        <Toaster position="bottom-left" />
        <OpfsViewer />
      </Allotment.Pane>
      <Allotment.Pane>
        <ApplicationContainer />
      </Allotment.Pane>
    </Allotment>
  );
};
