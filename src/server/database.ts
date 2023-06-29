import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// db.json file path
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFilePath = join(__dirname, '..', '..', 'db.json');

export type DBUserData = {
  email: string;
  password: string;
  refreshToken?: string | null;
};

export type DBData = {
  users: Array<DBUserData>;
};

const defaultData: DBData = { users: [] };
const adapter = new JSONFile<DBData>(dbFilePath);
export const db = new Low<DBData>(adapter, defaultData);

const DBService = {
  async write<TKey extends keyof DBData>(
    key: TKey,
    writer: (data: DBData) => DBData[TKey]
  ) {
    await db.read();
    const result = writer({ ...db.data });
    db.data[key] = result;
    await db.write();
  },
  async get<TKey extends keyof DBData>(key: TKey): Promise<DBData[TKey]> {
    await db.read();
    return db.data[key];
  },
};

export default DBService;
