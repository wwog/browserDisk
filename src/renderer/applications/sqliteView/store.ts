import { create } from 'zustand';
interface Table {
  name: string;
  columns: Column[];
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
    selected: null as Table | null,
    setSelected: (selected: Table | null) => {
      set({
        selected: selected,
      });
    },
  };
};
export const sqliteViewStore = create(callback);
