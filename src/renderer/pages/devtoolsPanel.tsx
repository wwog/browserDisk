import { FC, ReactNode } from 'react';
import { Allotment } from 'allotment';
import { Toaster } from 'react-hot-toast';

import 'allotment/dist/style.css';
interface DevtoolsPanelPageProps {
  children?: ReactNode;
}
export const DevtoolsPanelPage: FC<DevtoolsPanelPageProps> = (props) => {
  return (
    <Allotment>
      <Allotment.Pane snap minSize={160} maxSize={720} preferredSize={410}>
        <Toaster position="bottom-left" />
      </Allotment.Pane>
      <Allotment.Pane>right</Allotment.Pane>
    </Allotment>
  );
};
