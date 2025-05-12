import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sqliteViewStore } from '../../store';
import { AgGridReact } from 'ag-grid-react';
import { myTheme } from './theme';
import type { GridApi, PaginationChangedEvent } from 'ag-grid-community';
import { getRows } from './utils';

export const Table: FC = () => {
  const { selectedTable } = sqliteViewStore();
  const ref = useRef<GridApi>(null);
  const needAutoSize = useRef(true);
  useEffect(() => {
    needAutoSize.current = true;
  }, [selectedTable]);

  const [pageSize, setPageSize] = useState(50);

  const colDefs = useMemo(() => {
    if (!selectedTable) {
      return [];
    }
    return selectedTable.columns.map((item) => {
      return {
        field: item.name,
        headerName: item.name,
        sortable: true,
        filter: true,
        resizable: true,
      };
    });
  }, [selectedTable]);

  const handlePageSizeChange = useCallback(
    (params: PaginationChangedEvent) => {
      const newPageSize = params.api.paginationGetPageSize();
      if (newPageSize !== pageSize) {
        setPageSize(newPageSize);
      }
    },
    [pageSize]
  );

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        width: 0,
      }}
    >
      <AgGridReact
        datasource={{
          getRows: async (params) => {
            await getRows(params);
            if (needAutoSize.current && ref.current) {
              ref.current.autoSizeAllColumns();
              needAutoSize.current = false;
            }
          },
        }}
        columnDefs={colDefs}
        theme={myTheme}
        rowModelType="infinite"
        pagination={true}
        paginationPageSize={pageSize}
        paginationPageSizeSelector={[50, 100, 200]}
        onPaginationChanged={handlePageSizeChange}
        onGridReady={(params) => {
          ref.current = params.api;
        }}
        rowBuffer={pageSize} // 增加缓冲行数
        cacheBlockSize={pageSize} // 设置缓存块大小
        cacheOverflowSize={2} // 设置缓存溢出大小
        suppressColumnVirtualisation={true}
        defaultColDef={{
          minWidth: 100,
          maxWidth: 300,
          floatingFilter: true,
          editable: true,
          resizable: true, // 允许调整列宽
        }}
      />
    </div>
  );
};
