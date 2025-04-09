import { FC } from 'react';
import { sqliteViewStore } from '../../store';
import { clsx } from '../../../../../lib/sundry';
import { TableSvg } from '../../../../svg/table';
//@ts-ignore
import styles from './index.module.css';

export const TableList: FC = () => {
  const { selected, tables, setSelected } = sqliteViewStore();
  return (
    <div className={styles.tableListWrapper}>
      <div className={styles.top}>
        <div className={styles.tag}>ALLTables</div>
        <div className={styles.tableList}>
          {tables.map((table) => {
            const isSelected = selected?.name === table.name;
            return (
              <div
                key={table.name}
                onClick={() => setSelected(table)}
                className={clsx(isSelected && styles.selected, styles.item)}
              >
                <div className={styles.tableName}>
                  <TableSvg />
                  {table.name}
                </div>

                <div
                  className={styles.columns}
                  style={{
                    height: isSelected ? 'unset' : 0,
                    transform: `scale(${isSelected ? 1 : 0})`,
                  }}
                >
                  {table.columns.map((column) => (
                    <div key={column.name} className={styles.column}>
                      <div>({column.type ? column.type : 'unknown'})</div>
                      <div>{column.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
