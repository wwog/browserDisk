import { create } from 'zustand';
interface Table {
  name: string;
  columns: Column[];
  hasPrimaryKey: boolean;
}
interface Column {
  name: string;
  cid: number;
  dflt_value: string | null;
  notnull: number;
  pk: number;
  type: string;
}

const callback = (set: any) => {
  return {
    tables: [] as Table[],
    setTables: (tables: Table[]) => {
      set({
        tables: tables,
      });
    },
    selectedTable: null as Table | null,
    setSelectedTable: (selected: Table | null) => {
      set({
        selectedTable: selected,
      });
    },
  };
};
export const sqliteViewStore = create(callback);
