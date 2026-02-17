// IndexedDB utility for storing large files (audio and artwork)
const DB_NAME = 'PressedDB';
const DB_VERSION = 1;
const AUDIO_STORE = 'audioFiles';
const ARTWORK_STORE = 'artworkFiles';

let dbInstance = null;

// Initialize IndexedDB
export async function initDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ARTWORK_STORE)) {
        db.createObjectStore(ARTWORK_STORE, { keyPath: 'id' });
      }
    };
  });
}

// Store audio file
export async function saveAudioFile(id, file) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([AUDIO_STORE], 'readwrite');
    const store = transaction.objectStore(AUDIO_STORE);
    const request = store.put({ id, file, timestamp: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Get audio file
export async function getAudioFile(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([AUDIO_STORE], 'readonly');
    const store = transaction.objectStore(AUDIO_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result?.file || null);
    request.onerror = () => reject(request.error);
  });
}

// Delete audio file
export async function deleteAudioFile(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([AUDIO_STORE], 'readwrite');
    const store = transaction.objectStore(AUDIO_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Store artwork file
export async function saveArtworkFile(file) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ARTWORK_STORE], 'readwrite');
    const store = transaction.objectStore(ARTWORK_STORE);
    const request = store.put({ id: 'artwork', file, timestamp: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Get artwork file
export async function getArtworkFile() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ARTWORK_STORE], 'readonly');
    const store = transaction.objectStore(ARTWORK_STORE);
    const request = store.get('artwork');

    request.onsuccess = () => resolve(request.result?.file || null);
    request.onerror = () => reject(request.error);
  });
}

// Delete artwork file
export async function deleteArtworkFile() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ARTWORK_STORE], 'readwrite');
    const store = transaction.objectStore(ARTWORK_STORE);
    const request = store.delete('artwork');

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Clear all data from IndexedDB
export async function clearAllFiles() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([AUDIO_STORE, ARTWORK_STORE], 'readwrite');
    
    const audioStore = transaction.objectStore(AUDIO_STORE);
    const artworkStore = transaction.objectStore(ARTWORK_STORE);
    
    audioStore.clear();
    artworkStore.clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// LocalStorage utilities for metadata
const METADATA_KEY = 'pressed_metadata';
const LAST_SAVE_KEY = 'pressed_last_save';

export function saveMetadata(epData) {
  try {
    // Create a serializable version of epData (without File objects)
    const metadata = {
      epTitle: epData.epTitle,
      artistName: epData.artistName,
      tagline: epData.tagline,
      aboutText: epData.aboutText,
      colors: epData.colors,
      fontPair: epData.fontPair,
      allowDownload: epData.allowDownload,
      bandcampLink: epData.bandcampLink,
      streamingLinks: epData.streamingLinks,
      streamingSectionTitle: epData.streamingSectionTitle,
      tracks: epData.tracks.map(track => ({
        id: track.id,
        name: track.name,
        description: track.description,
        duration: track.duration,
        lyrics: track.lyrics,
        lyricsType: track.lyricsType,
        parsedLyrics: track.parsedLyrics,
        // Store file metadata but not the actual File object
        hasAudioFile: !!track.audioFile,
        audioFileName: track.audioFile?.name,
        hasAudioPreview: !!track.audioPreview,
      })),
      // Store artwork metadata
      hasArtwork: !!epData.artwork,
      artworkName: epData.artwork?.name,
      hasArtworkPreview: !!epData.artworkPreview,
    };

    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
    localStorage.setItem(LAST_SAVE_KEY, new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Failed to save metadata to localStorage:', error);
    return false;
  }
}

export function getMetadata() {
  try {
    const data = localStorage.getItem(METADATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load metadata from localStorage:', error);
    return null;
  }
}

export function getLastSaveTime() {
  try {
    const timestamp = localStorage.getItem(LAST_SAVE_KEY);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    return null;
  }
}

export function clearMetadata() {
  try {
    localStorage.removeItem(METADATA_KEY);
    localStorage.removeItem(LAST_SAVE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear metadata from localStorage:', error);
    return false;
  }
}

// Complete reset - clears both localStorage and IndexedDB
export async function resetAllData() {
  clearMetadata();
  await clearAllFiles();
}
