import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sqliteViewStore } from '../../store';
import { AgGridReact } from 'ag-grid-react';
import { myTheme } from './theme';
import type { GridApi, IGetRowsParams } from 'ag-grid-community';
import { getDataByGetRowsParams } from './utils';
import { Pagination } from './Pagination';
import { pageSizeState } from '../storageState';

const Selector = [20, 50, 100, 200];

export const Table: FC = () => {
  const { selectedTable } = sqliteViewStore();

  const ref = useRef<GridApi>(null);
  const needAutoSize = useRef(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = pageSizeState.use();
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    needAutoSize.current = true;
  }, [selectedTable]);

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

  const dataSource = useMemo(() => {
    return {
      getRows: async (params: IGetRowsParams) => {
        try {
          const { count, data } = await getDataByGetRowsParams(params);
          console.log('getRows', params, count, data);
          setTotalCount(count);
          if (needAutoSize.current && ref.current) {
            ref.current.autoSizeAllColumns();
            needAutoSize.current = false;
          }
          params.successCallback(data, count);
        } catch (error) {
          console.error('Error fetching data:', error);
          params.failCallback();
        }
      },
    };
  }, [selectedTable]);

  const onGridReady = useCallback((params: any) => {
    ref.current = params.api;
  }, []);

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        width: 0,
      }}
    >
      <AgGridReact
        containerStyle={{
          height: 'calc(100% - 40px)',
        }}
        datasource={dataSource}
        columnDefs={colDefs}
        theme={myTheme}
        rowModelType="infinite"
        pagination={true}
        paginationPageSize={pageSize}
        // suppressPaginationPanel={true}
        onGridReady={onGridReady}
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
      <Pagination
        count={totalCount}
        selector={Selector}
        page={page}
        pageSize={pageSize}
        onChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};
