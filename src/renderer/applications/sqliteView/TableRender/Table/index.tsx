import { FC, useEffect, useMemo, useState } from 'react';
import { sqliteViewStore } from '../../store';
import { AgGridReact } from 'ag-grid-react';
import { exec } from '../../callContentScript';
import { QueryBuilder } from '../../queryBuilder/query';

export const Table: FC = () => {
  const { selectedTable } = sqliteViewStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [colDefs, setColDefs] = useState<any[]>([]);
  const [rowData, setRowData] = useState<any[]>([]);

  useEffect(() => {
    if (selectedTable) {
      const columns = selectedTable.columns.map((item) => {
        return {
          field: item.name,
          headerName: item.name,
          sortable: true,
          filter: true,
          resizable: true,
        };
      });
      setColDefs(columns);
      const query = new QueryBuilder<any>()
        .select(selectedTable.columns.map((item) => item.name))
        .from(selectedTable.name)
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .toSQL();
      exec(...query).then((res: any) => {
        setRowData(res);
      });
    }
  }, [selectedTable, page, pageSize]);

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        width: 0,
      }}
    >
      <AgGridReact columnDefs={colDefs} rowData={rowData} />
    </div>
  );
};
