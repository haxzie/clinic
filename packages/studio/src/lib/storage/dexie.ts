import Dexie, { Table } from 'dexie';
import { StoredAPI, StoredCollection, StoredTabs, StoredEnvironment } from './db';

export class ClinicDatabase extends Dexie {
  apis!: Table<StoredAPI>;
  tabs!: Table<StoredTabs>;
  collections!: Table<StoredCollection>;
  environments!: Table<StoredEnvironment>;

  constructor() {
    super('ClinicDatabase');
    
    this.version(1).stores({
      apis: 'id, data.collectionId, data.createdAt, data.updatedAt',
      tabs: 'id, data.type, data.createdAt',
      collections: 'id, data.name, data.createdAt',
    });
    
    // Update to version 2 to add environments table
    this.version(2).stores({
      apis: 'id, data.collectionId, data.createdAt, data.updatedAt',
      tabs: 'id, data.type, data.createdAt',
      collections: 'id, data.name, data.createdAt',
      environments: 'id, data.name, data.createdAt, data.isDefault',
    });
  }
}

export const db = new ClinicDatabase();
