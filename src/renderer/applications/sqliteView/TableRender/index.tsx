import { FC } from 'react';
import { TableList } from './TableList';
//@ts-ignore
import css from './index.module.css';

export const TableRender: FC = () => {
  return (
    <div className={css.container}>
      <TableList />
    </div>
  );
};
