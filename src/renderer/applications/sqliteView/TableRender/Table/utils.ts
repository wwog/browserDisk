import type { IGetRowsParams } from 'ag-grid-community';
import { sqliteViewStore } from '../../store';
import { QueryBuilder } from '../../queryBuilder/query';
import { exec } from '../../callContentScript';

export async function getDataByGetRowsParams(params: IGetRowsParams) {
  const { startRow, endRow, sortModel, filterModel } = params;
  const pageSize = endRow - startRow;
  const page = Math.floor(startRow / pageSize) + 1;
  const selectedTable = sqliteViewStore.getState().selectedTable;
  const result = {
    count: 0,
    data: [],
  };
  if (!selectedTable) {
    return result;
  }

  const query = new QueryBuilder<any>()
    .select(selectedTable.columns.map((item) => item.name))
    .from(selectedTable.name)
    .limit(pageSize);

  if (filterModel) {
    /* TODO */
  }

  if (sortModel) {
    sortModel.forEach((item) => {
      const sortOrder = item.sort === 'asc' ? 'ASC' : 'DESC';
      query.orderBy(item.colId, sortOrder);
    });
  }

  const [sql, bindings] = query.offset(pageSize * (page - 1)).toSQL();
  const data = await exec(sql, {
    bind: bindings,
  });
  const count = await getCount(selectedTable.name);
  result.data = data;
  result.count = count;
  return result;
}

export async function getCount(tableName?: string) {
  const selectedTable = sqliteViewStore.getState().selectedTable;

  const tName = tableName ? tableName : selectedTable?.name;
  if (!tName) {
    throw new Error('No table selected');
  }
  const count = await exec('SELECT COUNT(*) FROM ' + tName).then((res) => {
    return res[0]['COUNT(*)'] as number;
  });
  return count;
}

export function copyText(text: string) {
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}
