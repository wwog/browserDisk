import type { IGetRowsParams } from 'ag-grid-community';
import { sqliteViewStore } from '../../store';
import { QueryBuilder } from '../../queryBuilder/query';
import { exec } from '../../callContentScript';

export async function getRows(params: IGetRowsParams) {
  const { startRow, endRow, successCallback, failCallback } = params;
  const pageSize = endRow - startRow;
  const page = Math.floor(startRow / pageSize) + 1;
  const selectedTable = sqliteViewStore.getState().selectedTable;
  if (!selectedTable) {
    successCallback([]);
    return;
  }

  try {
    const count = await exec('SELECT COUNT(*) FROM ' + selectedTable.name).then(
      (res) => {
        return res[0]['COUNT(*)'];
      }
    );
    const query = new QueryBuilder<any>()
      .select(selectedTable.columns.map((item) => item.name))
      .from(selectedTable.name)
      .limit(pageSize)
      .offset(pageSize * (page - 1))
      .toSQL();
    const data = await exec(query[0], {
      bind: query[1],
    });
    console.log('count', count);
    successCallback(data, count);
  } catch (error) {
    failCallback();
  }
}
