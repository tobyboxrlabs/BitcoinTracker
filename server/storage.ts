// No storage needed for this application as we're only proxying API calls
export interface IStorage {}
export class MemStorage implements IStorage {}
export const storage = new MemStorage();
