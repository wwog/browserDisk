import { FC } from 'react';
import { Allotment } from 'allotment';
import { Toaster } from 'react-hot-toast';
import { ApplicationService } from '../../services/appService/mod';
import { monacoApplication } from '../../applications/monaco';

import 'allotment/dist/style.css';

import { OpfsViewer } from './components/OpfsViewer';
import { ApplicationContainer } from './components/Application/container';
const appService = ApplicationService.getInstance();
appService.registerApplication(monacoApplication);

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
