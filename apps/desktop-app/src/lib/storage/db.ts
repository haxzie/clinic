import { APISchema, CollectionSchema } from '@/types/API.types';
import { TabSchema } from '@/store/editor-store/editor.types';
import { StorageDriver } from './driver';
import { db } from './dexie';

export interface StoredAPI {
    id: string;
    data: APISchema;
}

export interface StoredTabs {
    id: string;
    data: TabSchema;
}

export interface StoredCollection {
    id: string;
    data: CollectionSchema;
}

export class APIStorageDriver extends StorageDriver<StoredAPI> {
    constructor() {
        super('api');
    }

    async list(): Promise<Array<StoredAPI>> {
        try {
            return await db.apis.toArray();
        } catch (error) {
            console.error('Error listing APIs:', error);
            return [];
        }
    }

    async get(id: string): Promise<StoredAPI> {
        try {
            const api = await db.apis.get(id);
            if (!api) {
                throw new Error(`API with id ${id} not found`);
            }
            return api;
        } catch (error) {
            console.error(`Error getting API ${id}:`, error);
            throw error;
        }
    }

    async create(item: StoredAPI): Promise<StoredAPI> {
        try {
            await db.apis.add(item);
            return item;
        } catch (error) {
            console.error('Error creating API:', error);
            throw error;
        }
    }

    async update(id: string, item: StoredAPI): Promise<StoredAPI> {
        try {
            await db.apis.update(id, { data: item.data });
            return item;
        } catch (error) {
            console.error(`Error updating API ${id}:`, error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await db.apis.delete(id);
        } catch (error) {
            console.error(`Error deleting API ${id}:`, error);
            throw error;
        }
    }

    // Utility methods
    async findByCollection(collectionId: string): Promise<Array<StoredAPI>> {
        try {
            return await db.apis.where('data.collectionId').equals(collectionId).toArray();
        } catch (error) {
            console.error(`Error finding APIs by collection ${collectionId}:`, error);
            return [];
        }
    }

    async findByMethod(method: string): Promise<Array<StoredAPI>> {
        try {
            return await db.apis.where('data.method').equals(method).toArray();
        } catch (error) {
            console.error(`Error finding APIs by method ${method}:`, error);
            return [];
        }
    }
}

export class CollectionStorageDriver extends StorageDriver<StoredCollection> {
    constructor() {
        super('collection');
    }

    async list(): Promise<Array<StoredCollection>> {
        try {
            return await db.collections.toArray();
        } catch (error) {
            console.error('Error listing collections:', error);
            return [];
        }
    }

    async get(id: string): Promise<StoredCollection> {
        try {
            const collection = await db.collections.get(id);
            if (!collection) {
                throw new Error(`Collection with id ${id} not found`);
            }
            return collection;
        } catch (error) {
            console.error(`Error getting collection ${id}:`, error);
            throw error;
        }
    }

    async create(item: StoredCollection): Promise<StoredCollection> {
        try {
            await db.collections.add(item);
            return item;
        } catch (error) {
            console.error('Error creating collection:', error);
            throw error;
        }
    }

    async update(id: string, item: StoredCollection): Promise<StoredCollection> {
        try {
            await db.collections.update(id, { data: item.data });
            return item;
        } catch (error) {
            console.error(`Error updating collection ${id}:`, error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await db.collections.delete(id);
        } catch (error) {
            console.error(`Error deleting collection ${id}:`, error);
            throw error;
        }
    }

    // Utility methods
    async findByName(name: string): Promise<Array<StoredCollection>> {
        try {
            return await db.collections.where('data.name').equals(name).toArray();
        } catch (error) {
            console.error(`Error finding collections by name ${name}:`, error);
            return [];
        }
    }

    async getActiveCollections(): Promise<Array<StoredCollection>> {
        try {
            return await db.collections.orderBy('data.createdAt').reverse().toArray();
        } catch (error) {
            console.error('Error getting active collections:', error);
            return [];
        }
    }
}

export class TabStorageDriver extends StorageDriver<StoredTabs> {
    constructor() {
        super('tab');
    }

    async list(): Promise<Array<StoredTabs>> {
        try {
            return await db.tabs.toArray();
        } catch (error) {
            console.error('Error listing tabs:', error);
            return [];
        }
    }

    async get(id: string): Promise<StoredTabs> {
        try {
            const tab = await db.tabs.get(id);
            if (!tab) {
                throw new Error(`Tab with id ${id} not found`);
            }
            return tab;
        } catch (error) {
            console.error(`Error getting tab ${id}:`, error);
            throw error;
        }
    }

    async create(item: StoredTabs): Promise<StoredTabs> {
        try {
            await db.tabs.add(item);
            return item;
        } catch (error) {
            console.error('Error creating tab:', error);
            throw error;
        }
    }

    async update(id: string, item: StoredTabs): Promise<StoredTabs> {
        try {
            await db.tabs.update(id, { data: item.data });
            return item;
        } catch (error) {
            console.error(`Error updating tab ${id}:`, error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await db.tabs.delete(id);
        } catch (error) {
            console.error(`Error deleting tab ${id}:`, error);
            throw error;
        }
    }

    // Utility methods
    async findByType(type: string): Promise<Array<StoredTabs>> {
        try {
            return await db.tabs.where('data.type').equals(type).toArray();
        } catch (error) {
            console.error(`Error finding tabs by type ${type}:`, error);
            return [];
        }
    }

    async getActiveTabs(): Promise<Array<StoredTabs>> {
        try {
            return await db.tabs.orderBy('data.createdAt').reverse().toArray();
        } catch (error) {
            console.error('Error getting active tabs:', error);
            return [];
        }
    }
}

// Export instances for easy use
export const apiStorage = new APIStorageDriver();
export const tabStorage = new TabStorageDriver();
export const collectionStorage = new CollectionStorageDriver();


