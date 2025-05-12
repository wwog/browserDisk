import { FC } from 'react';
import { TableList } from './TableList';
//@ts-ignore
import css from './index.module.css';
import { Table } from './Table';
import { sqliteViewStore } from '../store';
import { If } from '../../../components/Common/If';

export const TableRender: FC = () => {
  const { selectedTable } = sqliteViewStore();
  return (
    <div className={css.container}>
      <TableList />
      <If condition={!!selectedTable}>
        <Table />
        <If.Else>
          <div className={css.empty}>No table selected</div>
        </If.Else>
      </If>
    </div>
  );
};
