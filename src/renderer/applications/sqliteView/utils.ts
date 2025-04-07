import { exec } from './callContentScript';

export const getAllTables = async () => {
  const tables = await exec(
    `SELECT name FROM sqlite_master WHERE type='table'`
  );
  return tables;
};
