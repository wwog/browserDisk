import { FC } from 'react';
import { sqliteViewStore } from '../../store';
import { clsx } from '../../../../../lib/sundry';
import { TableSvg } from '../../../../svg/table';
//@ts-ignore
import styles from './index.module.css';
import { If } from '../../../../components/Common/If';

export const TableList: FC = () => {
  const {
    selectedTable: selected,
    tables,
    setSelectedTable: setSelected,
  } = sqliteViewStore();
  console.log('tables', tables);
  return (
    <div className={styles.tableListWrapper}>
      <div className={styles.top}>
        <div className={styles.tag}>ALLTables</div>
        <div className={styles.tableList}>
          <If condition={tables.length > 0}>
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
                    <If condition={table.columns.length > 0}>
                      {table.columns.map((column) => (
                        <div key={column.name} className={styles.column}>
                          <div>({column.type ? column.type : 'unknown'})</div>
                          <div className={styles.columnName}>
                            <If condition={column.pk === 1}>
                              <div className={styles.pk}>P</div>
                            </If>
                            {column.name}
                          </div>
                        </div>
                      ))}
                      <If.Else>
                        <div className={styles.noColumn}>No columns</div>
                      </If.Else>
                    </If>
                  </div>
                </div>
              );
            })}
            <If.Else>
              <div className={styles.noTable}>No tables</div>
            </If.Else>
          </If>
        </div>
      </div>
    </div>
  );
};
