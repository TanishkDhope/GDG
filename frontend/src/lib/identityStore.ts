// src/lib/identityStore.ts
import { openDB, IDBPDatabase } from 'idb';

export type VoterCredentials = {
  id?: string; // optional internal id (timestamp/uuid)
  identitySecret: string;
  merkleRoot: string;
  leafIndex: number;
  pathElements: string[];
  pathIndices: string[];
  electionId?: string;
  registeredAt: string;
};

const DB_NAME = 'zk-voting-db';
const DB_VERSION = 2; // keep in sync with your voteCache DB version if you bumped it
const STORE = 'voter-credentials';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          // optional index by election for queries
          store.createIndex('byElection', 'electionId', { unique: false });
        }
        // Do not remove existing stores (cached-votes etc.)
        // If you need extra stores, create them here safely.
      },
    });
  }
  return dbPromise;
}

export async function saveVoterCredentials(creds: VoterCredentials) {
  const db = await getDB();
  // ensure id
  const payload = { ...creds, id: creds.id ?? `${Date.now()}-${Math.random().toString(36).slice(2,8)}` };
  await db.put(STORE, payload);
  return payload;
}

export async function loadLatestVoterCredentials(): Promise<VoterCredentials | null> {
  const db = await getDB();
  const all = await db.getAll(STORE);
  if (!all || all.length === 0) return null;
  // return the most recent by registeredAt or id timestamp
  all.sort((a: any, b: any) => {
    const ta = new Date(a.registeredAt).getTime() || 0;
    const tb = new Date(b.registeredAt).getTime() || 0;
    return tb - ta;
  });
  return all[0] as VoterCredentials;
}

export async function loadVoterCredentialsById(id: string): Promise<VoterCredentials | null> {
  const db = await getDB();
  return (await db.get(STORE, id)) as VoterCredentials | null;
}

export async function clearAllVoterCredentials() {
  const db = await getDB();
  const keys = await db.getAllKeys(STORE);
  for (const k of keys) {
    await db.delete(STORE, k as any);
  }
}

export async function listAllVoterCredentials() {
  const db = await getDB();
  return db.getAll(STORE) as Promise<VoterCredentials[]>;
}
