import { FC } from 'react';
import { sqliteViewStore } from '../store';
import { ArrayRender } from '../../../components/Common/ArrayRender';
//@ts-ignore
import css from './index.module.css';

export const TableRender: FC = () => {
  const tables = sqliteViewStore().tables;
  return (
    <div className={css.container}>
      <ArrayRender
        items={tables}
        renderItem={(item) => {
          return <div>{item.name}</div>;
        }}
      />
    </div>
  );
};
