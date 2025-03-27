import { FC } from 'react';
import { Allotment } from 'allotment';
import { Toaster } from 'react-hot-toast';

import 'allotment/dist/style.css';

import { OpfsViewer } from './components/OpfsViewer';

export const DevtoolsPanelPage: FC = () => {
  return (
    <Allotment>
      <Allotment.Pane snap minSize={160} maxSize={720} preferredSize={410}>
        <Toaster position="bottom-left" />
        <OpfsViewer />
      </Allotment.Pane>
      <Allotment.Pane>right</Allotment.Pane>
    </Allotment>
  );
};
