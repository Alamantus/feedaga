import Dexie from 'dexie';

const db = new Dexie('feedCache');
db.version(1).stores({
  entries: '++id, feed, name, pubDate',
});

export default db;
