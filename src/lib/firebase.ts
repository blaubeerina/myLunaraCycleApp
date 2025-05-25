
// Mock Firebase setup for client-side development
// This simulates Firestore operations using localStorage.

import type { PinterestJournalEntry } from '@/lib/types';

const DB_KEY_PREFIX = 'myLunaraCycle_pinterestJournal_';

// Mock DB object (not really used, but good for imports)
export const db = {
  // In a real Firebase setup, this would be your Firestore instance
};

// Mock Firestore functions
export const collection = (dbObject: any, path: string) => {
  // In a real setup, `path` would be the collection name, e.g., 'journal'
  // For mock, we just use it to construct localStorage key
  return {
    path,
    // Add other collection methods if needed for more complex mocks
  };
};

export const doc = (dbObject: any, collectionPath: string, docId: string) => {
  return {
    path: `${collectionPath}/${docId}`, // Mock path
    id: docId,
    // Add other doc methods if needed
  };
};

export const addDoc = async (collectionRef: { path: string }, data: Omit<PinterestJournalEntry, 'id'>): Promise<{ id: string }> => {
  console.log('[Mock Firestore] addDoc to collection:', collectionRef.path, 'with data:', data);
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate latency

  const collectionKey = `${DB_KEY_PREFIX}${collectionRef.path}`;
  const entries = JSON.parse(localStorage.getItem(collectionKey) || '[]') as PinterestJournalEntry[];
  
  const newId = Date.now().toString(); // Simple unique ID for mock
  const newEntry: PinterestJournalEntry = { ...data, id: newId };
  
  entries.push(newEntry);
  localStorage.setItem(collectionKey, JSON.stringify(entries));
  
  // Notify listeners for onSnapshot simulation
  const event = new CustomEvent(`mockDbChange_${collectionRef.path}`, { detail: entries });
  window.dispatchEvent(event);

  return { id: newId };
};

export const updateDoc = async (docRef: { path: string; id: string }, data: Partial<PinterestJournalEntry>): Promise<void> => {
  console.log('[Mock Firestore] updateDoc for doc:', docRef.path, 'with data:', data);
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate latency

  const collectionName = docRef.path.split('/')[0];
  const collectionKey = `${DB_KEY_PREFIX}${collectionName}`;
  let entries = JSON.parse(localStorage.getItem(collectionKey) || '[]') as PinterestJournalEntry[];
  
  entries = entries.map(entry => 
    entry.id === docRef.id ? { ...entry, ...data, lastUpdated: new Date().toISOString() } : entry
  );
  localStorage.setItem(collectionKey, JSON.stringify(entries));

  // Notify listeners for onSnapshot simulation
  const event = new CustomEvent(`mockDbChange_${collectionName}`, { detail: entries });
  window.dispatchEvent(event);
};


export const onSnapshot = (
  collectionRef: { path: string },
  callback: (snapshot: { docs: Array<{ id: string; data: () => PinterestJournalEntry }> }) => void
): (() => void) => { // Returns an unsubscribe function
  console.log('[Mock Firestore] onSnapshot for collection:', collectionRef.path);

  const collectionKey = `${DB_KEY_PREFIX}${collectionRef.path}`;
  
  // Initial data load
  const loadData = () => {
    const entries = JSON.parse(localStorage.getItem(collectionKey) || '[]') as PinterestJournalEntry[];
    const snapshot = {
      docs: entries.map(entry => ({
        id: entry.id,
        data: () => entry, // Firestore's doc.data() is a function
      })),
    };
    callback(snapshot);
  };
  
  loadData(); // Call once initially

  // Listen for custom event that signals a change in mock DB
  const eventName = `mockDbChange_${collectionRef.path}`;
  const handleChange = (event: Event) => {
    const customEvent = event as CustomEvent<PinterestJournalEntry[]>;
    const updatedEntries = customEvent.detail;
     const snapshot = {
      docs: updatedEntries.map(entry => ({
        id: entry.id,
        data: () => entry,
      })),
    };
    callback(snapshot);
  };

  window.addEventListener(eventName, handleChange);

  // Return an unsubscribe function
  return () => {
    console.log('[Mock Firestore] unsubscribing from onSnapshot for:', collectionRef.path);
    window.removeEventListener(eventName, handleChange);
  };
};

// Mock serverTimestamp if needed by other parts of the app
export const serverTimestamp = () => new Date(); // In real Firebase, this is a placeholder
