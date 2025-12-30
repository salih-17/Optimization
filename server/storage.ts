// Storage interface for container optimization
// Note: This application uses client-side sessionStorage for state management
// Backend is stateless and processes requests on-demand

export interface IStorage {
  // Placeholder for future persistence needs
  // Currently all data flows through API endpoints without server-side storage
}

export class MemStorage implements IStorage {
  constructor() {
    // No persistent storage needed for MVP
    // All optimization data is processed on-demand via API calls
  }
}

export const storage = new MemStorage();
