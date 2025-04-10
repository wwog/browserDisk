import { FC } from 'react';
import { TableList } from './TableList';
//@ts-ignore
import css from './index.module.css';
import { Table } from './Table';

export const TableRender: FC = () => {
  return (
    <div className={css.container}>
      <TableList />
      <Table />
    </div>
  );
};
