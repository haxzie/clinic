import Dexie, { Table } from 'dexie';
import { StoredAPI, StoredCollection, StoredTabs } from './db';

export class ClinicDatabase extends Dexie {
  apis!: Table<StoredAPI>;
  tabs!: Table<StoredTabs>;
  collections!: Table<StoredCollection>;

  constructor() {
    super('ClinicDatabase');
    
    this.version(1).stores({
      apis: 'id, data.collectionId, data.createdAt, data.updatedAt',
      tabs: 'id, data.type, data.createdAt',
      collections: 'id, data.name, data.createdAt',
    });
  }
}

export const db = new ClinicDatabase();
