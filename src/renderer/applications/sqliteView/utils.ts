import { exec } from './callContentScript';

export const getAllTables = async () => {
  const tables = (await exec(
    `SELECT name FROM sqlite_master WHERE type='table'`
  )) as any[];
  console.log('tables', tables);
  await Promise.all(
    tables.map(async (table) => {
      const columns = await exec(`PRAGMA table_info(${table.name})`);
      table.columns = columns;
    })
  );
  return tables;
};
