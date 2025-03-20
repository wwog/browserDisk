import { FC, ReactNode } from 'react';
import '../global.css';

interface LayoutProps {
  children?: ReactNode;
}
export const Layout: FC<LayoutProps> = (props) => {
  return <>{props.children}</>;
};
