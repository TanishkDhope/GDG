import { openDB } from 'idb';

const DB_NAME = 'zk-voting-db';
const STORE_NAME = 'cached-votes';

export const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

export async function cacheVote(vote: any) {
  const db = await dbPromise;
  await db.put(STORE_NAME, vote);
}

export async function getCachedVotes() {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
}

export async function markVoteSynced(id: string) {
  const db = await dbPromise;
  const vote = await db.get(STORE_NAME, id);
  if (!vote) return;
  vote.synced = true;
  await db.put(STORE_NAME, vote);
}

export async function clearSyncedVotes() {
  const db = await dbPromise;
  const allVotes = await db.getAll(STORE_NAME);
  for (const vote of allVotes) {
    if (vote.synced) {
      await db.delete(STORE_NAME, vote.id);
    }
  }
}
