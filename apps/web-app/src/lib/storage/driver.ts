export abstract class StorageDriver<T> {
  private entity: string;

  constructor(entity: string) {
    this.entity = entity;
  }

  getEntity(): string {
    return this.entity;
  }

  abstract list(): Promise<Array<T>>;
  abstract get(id: string): Promise<T>;
  abstract create(item: T): Promise<T>;
  abstract update(id: string, item: T): Promise<T>;
  abstract delete(id: string): Promise<void>;
}