import type { ComponentType, ReactNode } from 'react';

export enum ApplicationType {
  FileViewer = 'file_viewer',
  Standalone = 'standalone',
}

export interface ApplicationProps {
  filePath?: string; // 现在是可选的
  extName?: string; // 现在是可选的
  appId: string; // 添加应用ID
  instanceId: string; // 添加实例ID
}

export interface Application {
  id: string;
  name: string;
  showName?: (name: string, path?: string) => string;
  icon: ReactNode;
  type: ApplicationType; // 新增类型字段
  supportedFileTypes?: string[]; // 现在是可选的
  component: ComponentType<ApplicationProps>;
  singleton?: boolean; // 是否为单例应用，即只能开一个实例
}

export interface ApplicationInstance {
  id: string;
  showName: string;
  appId: string;
  filePath?: string; // 现在是可选的
  extName?: string; // 现在是可选的
  active: boolean;
}
