import { createRoot } from 'react-dom/client';
import { Layout } from '../layout';
import { DevtoolsPanelPage } from '../pages/devtoolsPanel';
import { StrictMode } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const container = document.getElementById('root')!;

const root = createRoot(container);

root.render(
  <StrictMode>
    <Layout>
      <DevtoolsPanelPage />
    </Layout>
  </StrictMode>
);
