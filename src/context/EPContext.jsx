import { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  saveMetadata,
  getMetadata,
  saveAudioFile,
  saveArtworkFile,
  getAudioFile,
  getArtworkFile,
  deleteAudioFile,
  resetAllData,
  getLastSaveTime,
} from '../utils/storage';

const EPContext = createContext(null);

const emptyEPData = {
  artistName: '',
  epTitle: '',
  tagline: '',
  aboutText: '',
  allowDownload: false,
  artwork: null,
  artworkPreview: null,
  colors: {
    primary: '#222222',
    secondary: '#4F6A89',
    accent: '#D8A34A',
    paper: '#F4F0E6',
  },
  fontPair: 'serif',
  tracks: [],
  bandcampLink: '',
  streamingLinks: [],
  streamingSectionTitle: 'stream from a billionaire',
};

// Platform detection for streaming links
const platformPatterns = {
  spotify: /^https?:\/\/(open\.)?spotify\.com\//i,
  appleMusic: /^https?:\/\/music\.apple\.com\//i,
  youtubeMusic: /^https?:\/\/music\.youtube\.com\//i,
  tidal: /^https?:\/\/(www\.)?tidal\.com\//i,
  amazonMusic: /^https?:\/\/music\.amazon\.com\//i,
  behindTheScenes: /^https?:\/\/(www\.)?behindthescenes\./i,
};

function detectPlatform(url) {
  if (!url) return null;
  for (const [platform, pattern] of Object.entries(platformPatterns)) {
    if (pattern.test(url)) return platform;
  }
  return null;
}

const fontPairs = {
  serif: {
    name: 'Serif / Analog',
    heading: 'Georgia, serif',
    body: 'Georgia, serif',
    mono: "'Courier New', monospace",
  },
  mono: {
    name: 'Mono / Tech',
    heading: "'Courier New', monospace",
    body: 'system-ui, sans-serif',
    mono: "'Courier New', monospace",
  },
  sans: {
    name: 'Sans / Modern',
    heading: 'system-ui, sans-serif',
    body: 'system-ui, sans-serif',
    mono: "'Courier New', monospace",
  },
};

export function EPProvider({ children }) {
  const [epData, setEPData] = useState(emptyEPData);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const isInitialMount = useRef(true);

  // Hydrate data from storage on mount
  useEffect(() => {
    async function hydrateData() {
      try {
        const metadata = getMetadata();
        if (!metadata) {
          setIsHydrated(true);
          return;
        }

        // Restore metadata - explicitly preserve all fields
        const restoredData = {
          ...emptyEPData,
          epTitle: metadata.epTitle,
          artistName: metadata.artistName,
          tagline: metadata.tagline,
          aboutText: metadata.aboutText,
          allowDownload: metadata.allowDownload,
          colors: metadata.colors,
          fontPair: metadata.fontPair,
          bandcampLink: metadata.bandcampLink,
          streamingLinks: metadata.streamingLinks,
          streamingSectionTitle: metadata.streamingSectionTitle,
          tracks: [],
          artwork: null,
          artworkPreview: null,
        };

        // Restore artwork if it exists
        if (metadata.hasArtwork) {
          const artworkFile = await getArtworkFile();
          if (artworkFile) {
            restoredData.artwork = artworkFile;
            restoredData.artworkPreview = URL.createObjectURL(artworkFile);
          }
        }

        // Restore tracks with their audio files
        for (const trackMeta of metadata.tracks) {
          const track = { ...trackMeta };
          
          if (trackMeta.hasAudioFile) {
            const audioFile = await getAudioFile(trackMeta.id);
            if (audioFile) {
              track.audioFile = audioFile;
              track.audioPreview = URL.createObjectURL(audioFile);
            }
          }

          restoredData.tracks.push(track);
        }

        setEPData(restoredData);
        setLastSaveTime(getLastSaveTime());
        console.log('✅ Project restored from storage');
      } catch (error) {
        console.error('Failed to hydrate data:', error);
      } finally {
        setIsHydrated(true);
      }
    }

    hydrateData();
  }, []);

  // Auto-save effect - triggers on epData changes
  useEffect(() => {
    // Skip on initial mount and before hydration
    if (isInitialMount.current || !isHydrated) {
      isInitialMount.current = false;
      return;
    }

    const saveData = async () => {
      try {
        setIsSaving(true);

        // Save metadata to localStorage
        saveMetadata(epData);

        // Save artwork to IndexedDB if it exists
        if (epData.artwork) {
          await saveArtworkFile(epData.artwork);
        }

        // Save audio files to IndexedDB
        for (const track of epData.tracks) {
          if (track.audioFile) {
            await saveAudioFile(track.id, track.audioFile);
          }
        }

        setLastSaveTime(new Date());
        console.log('💾 Auto-saved');
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    };

    // Debounce auto-save by 1 second
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [epData, isHydrated]);

  const updateField = (field, value) => {
    setEPData((prev) => ({ ...prev, [field]: value }));
  };

  const updateColor = (colorKey, value) => {
    setEPData((prev) => ({
      ...prev,
      colors: { ...prev.colors, [colorKey]: value },
    }));
  };

  const addTrack = () => {
    const newTrack = {
      id: Date.now(),
      name: '',
      description: '',
      duration: '',
      audioFile: null,
      audioPreview: null,
      lyricsType: 'none',
      lyricsText: '',
      lyricsFile: null,
      parsedLyrics: null,
    };
    setEPData((prev) => ({
      ...prev,
      tracks: [...prev.tracks, newTrack],
    }));
  };

  const updateTrack = (trackId, field, value) => {
    setEPData((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId ? { ...t, [field]: value } : t
      ),
    }));
  };

  const removeTrack = async (trackId) => {
    // Delete audio file from IndexedDB
    try {
      await deleteAudioFile(trackId);
    } catch (error) {
      console.error('Failed to delete audio file:', error);
    }
    
    setEPData((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((t) => t.id !== trackId),
    }));
  };

  const reorderTracks = (fromIndex, toIndex) => {
    setEPData((prev) => {
      const newTracks = [...prev.tracks];
      const [removed] = newTracks.splice(fromIndex, 1);
      newTracks.splice(toIndex, 0, removed);
      return { ...prev, tracks: newTracks };
    });
  };

  const setArtwork = (file) => {
    if (file) {
      const preview = URL.createObjectURL(file);
      setEPData((prev) => ({
        ...prev,
        artwork: file,
        artworkPreview: preview,
      }));
    }
  };

  const addStreamingLink = () => {
    const newLink = {
      id: Date.now(),
      url: '',
      platform: null,
      error: null,
    };
    setEPData((prev) => ({
      ...prev,
      streamingLinks: [...prev.streamingLinks, newLink],
    }));
  };

  const updateStreamingLink = (linkId, url) => {
    const platform = detectPlatform(url);
    const error = url && !platform ? 'Please provide a valid URL to a streaming platform owned by a billionaire' : null;
    setEPData((prev) => ({
      ...prev,
      streamingLinks: prev.streamingLinks.map((link) =>
        link.id === linkId ? { ...link, url, platform, error } : link
      ),
    }));
  };

  const removeStreamingLink = (linkId) => {
    setEPData((prev) => ({
      ...prev,
      streamingLinks: prev.streamingLinks.filter((link) => link.id !== linkId),
    }));
  };

  const resetProject = async () => {
    if (window.confirm('Are you sure you want to reset the project? This will clear all data and cannot be undone.')) {
      try {
        await resetAllData();
        setEPData(emptyEPData);
        setLastSaveTime(null);
        console.log('🗑️ Project reset');
      } catch (error) {
        console.error('Failed to reset project:', error);
        alert('Failed to reset project. Please try again.');
      }
    }
  };

  const value = {
    epData,
    fontPairs,
    updateField,
    updateColor,
    addTrack,
    updateTrack,
    removeTrack,
    reorderTracks,
    setArtwork,
    addStreamingLink,
    updateStreamingLink,
    removeStreamingLink,
    resetProject,
    lastSaveTime,
    isSaving,
    isHydrated,
  };

  return <EPContext.Provider value={value}>{children}</EPContext.Provider>;
}

export function useEP() {
  const context = useContext(EPContext);
  if (!context) {
    throw new Error('useEP must be used within an EPProvider');
  }
  return context;
}
