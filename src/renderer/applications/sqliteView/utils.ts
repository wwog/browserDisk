import { exec } from './callContentScript';

export const getAllTables = async () => {
  const tables = (await exec(
    `SELECT name FROM sqlite_master WHERE type='table'`
  )) as any[];
  await Promise.all(
    tables.map(async (table) => {
      // 获取表的列信息
      const columns: any[] = await exec(`PRAGMA table_info(${table.name})`);
      // 获取索引
      const indexes: any[] = await exec(`PRAGMA index_list(${table.name})`);
      // 获取索引的列信息
      await Promise.all(
        indexes.map(async (indexItem) => {
          const columns = await exec(`PRAGMA index_info(${indexItem.name})`);
          indexItem.columns = columns;
        })
      );
      const hasPrimaryKey = columns.some((column) => column.pk === 1);

      table.hasPrimaryKey = hasPrimaryKey;
      if (table.hasPrimaryKey === false) {
        columns.push({
          name: 'rowid',
          cid: -1,
          dflt_value: null,
          notnull: 0,
          pk: 1,
          type: 'INTEGER',
        });
      }
      table.columns = columns.sort((a, b) => {
        return a.cid - b.cid;
      });
      table.indexes = indexes;
    })
  );
  return tables;
};
