import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sqliteViewStore } from '../../store';
import { AgGridReact } from 'ag-grid-react';
import { myTheme } from './theme';
import type { GridApi, IGetRowsParams } from 'ag-grid-community';
import { copyText, getDataByGetRowsParams } from './utils';
import { Pagination } from './Pagination';
import { pageSizeState } from '../storageState';

import './content-menu.css';
import { callServiceWorker } from '../../callContentScript';
import { callContentScript } from '../../../../services/fileService/helper';
import toast from 'react-hot-toast';

const Selector = [20, 50, 100, 200];

export const Table: FC = () => {
  const { selectedTable } = sqliteViewStore();

  const ref = useRef<GridApi>(null);
  const needAutoSize = useRef(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = pageSizeState.use();
  const [totalCount, setTotalCount] = useState(0);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    rowData: null,
    columnId: '',
  });
  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    needAutoSize.current = true;
    setPage(1);
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

  const handleGridReady = useCallback((params: any) => {
    ref.current = params.api;
  }, []);

  const handleCopyRowToJson = useCallback(() => {
    if (contextMenu.rowData) {
      const json = JSON.stringify(contextMenu.rowData, null, 2);
      copyText(json);
      toast.success('复制成功', {
        position: 'top-center',
        duration: 1000,
      });
    }
    closeContextMenu();
  }, [contextMenu]);

  const handleCellContextMenu = useCallback((e: any) => {
    if (e.event) {
      const event = e.event as MouseEvent;
      event.preventDefault();
      event.stopPropagation();
      const { data, column } = e;
      const colId = column.getColId();
      event?.preventDefault();
      setContextMenu({
        visible: true,
        x: event?.clientX,
        y: event?.clientY,
        rowData: data,
        columnId: colId,
      });
    }
  }, []);

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        width: 0,
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      {/* 使用同一个示例来使用AG-Grid会需要非常多的额外逻辑，接入外部状态也不好用 */}
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
        suppressPaginationPanel={true}
        onGridReady={handleGridReady}
        onCellContextMenu={handleCellContextMenu}
        preventDefaultOnContextMenu={true}
        rowBuffer={pageSize} // 增加缓冲行数
        cacheBlockSize={pageSize} // 设置缓存块大小
        cacheOverflowSize={2} // 设置缓存溢出大小
        suppressColumnVirtualisation={true}
        defaultColDef={{
          minWidth: 100,
          maxWidth: 350,
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
        onChange={(cur) => {
          setPage(cur);
          ref.current?.paginationGoToPage(cur - 1);
        }}
        onPageSizeChange={setPageSize}
      />

      {/* 自定义右键菜单 */}
      {contextMenu.visible && (
        <div
          id="context-menu"
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
          <div className="menu-item" onClick={handleCopyRowToJson}>
            复制行到 JSON
          </div>
        </div>
      )}
    </div>
  );
};
