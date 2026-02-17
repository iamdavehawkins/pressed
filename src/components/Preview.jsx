import { useState, useRef, useEffect } from 'react';
import { useEP } from '../context/EPContext';
import { Play, Pause, Monitor, Smartphone } from 'lucide-react';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getCurrentLyricIndex(lyrics, time) {
  if (!lyrics || lyrics.length === 0) return -1;
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (time >= lyrics[i].time) {
      return i;
    }
  }
  return -1;
}

const platformIcons = {
  spotify: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" style={{ width: '32px', height: '32px', fill: 'currentColor', marginBottom: '8px' }}><path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 30.6 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/></svg>,
  appleMusic: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style={{ width: '32px', height: '32px', fill: 'currentColor', marginBottom: '8px' }}><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>,
  youtubeMusic: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style={{ width: '32px', height: '32px', fill: 'currentColor', marginBottom: '8px' }}><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>,
  tidal: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: '32px', height: '32px', fill: 'currentColor', marginBottom: '8px' }}><path d="M3 9l3-3 3 3-3 3-3-3zm6 0l3-3 3 3-3 3-3-3zm6 0l3-3 3 3-3 3-3-3zm-6 6l3-3 3 3-3 3-3-3z"/></svg>,
  amazonMusic: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{ width: '32px', height: '32px', fill: 'currentColor', marginBottom: '8px' }}><path d="M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5 0 109.5 138.3 114 183.5 43.2 6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32 140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5 40.7-.1 35.5 29.8 35.5 69.1zm0 86.8c0 80-84.2 68-84.2 17.2 0-47.2 50.5-56.7 84.2-57.8v40.6zm136 163.5c-7.7 10-70 67-174.5 67S34.2 408.5 9.7 379c-6.8-7.7 1-11.3 5.5-8.3C88.5 415.2 203 488.5 387.7 401c7.5-3.7 13.3 2 5.5 12zm39.8 2.2c-6.5 15.8-16 26.8-21.2 31-5.5 4.5-9.5 2.7-6.5-3.8s19.3-46.5 12.7-55c-6.5-8.3-37-4.3-48-3.2-10.8 1-13 2-14-.3-2.3-5.7 21.7-15.5 37.5-17.5 15.7-1.8 41-.8 46 5.7 3.7 5.1 0 27.1-6.5 43.1z"/></svg>,
  behindTheScenes: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: '32px', height: '32px', fill: 'currentColor', marginBottom: '8px' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
};

const platformLabels = {
  spotify: 'Spotify',
  appleMusic: 'Apple Music',
  youtubeMusic: 'YouTube Music',
  tidal: 'Tidal',
  amazonMusic: 'Amazon Music',
  behindTheScenes: 'Behind the Scenes',
};

function StreamingButton({ link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '18px 12px',
        background: 'var(--color-secondary)',
        color: 'var(--color-paper)',
        textDecoration: 'none',
        borderRadius: '8px',
        fontFamily: 'var(--font-body)',
        fontSize: '0.9em',
        minHeight: '90px',
        transition: 'all 0.2s ease',
      }}
    >
      {platformIcons[link.platform]}
      {platformLabels[link.platform]}
    </a>
  );
}

export default function Preview() {
  const { epData, fontPairs } = useEP();
  const [viewMode, setViewMode] = useState('desktop');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const audioRef = useRef(null);

  const fonts = fontPairs[epData.fontPair] || fontPairs.serif;
  const colors = epData.colors;

  const currentTrack = currentTrackIndex !== null ? epData.tracks[currentTrackIndex] : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (currentTrack?.parsedLyrics) {
        const idx = getCurrentLyricIndex(currentTrack.parsedLyrics, audio.currentTime);
        setCurrentLyricIndex(idx);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (currentTrackIndex !== null && currentTrackIndex < epData.tracks.length - 1) {
        playTrack(currentTrackIndex + 1);
      } else {
        setIsPlaying(false);
        setCurrentTrackIndex(null);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, currentTrack, epData.tracks.length]);

  const playTrack = (index) => {
    const track = epData.tracks[index];
    if (!track?.audioPreview) return;

    if (currentTrackIndex === index && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (currentTrackIndex !== index) {
      setCurrentTrackIndex(index);
      setCurrentLyricIndex(-1);
      if (audioRef.current) {
        audioRef.current.src = track.audioPreview;
        audioRef.current.load();
      }
    }

    setTimeout(() => {
      audioRef.current?.play();
      setIsPlaying(true);
    }, 50);
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const closeStickyPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrackIndex(null);
    setCurrentLyricIndex(-1);
  };

  const previewStyle = {
    '--color-primary': colors.primary,
    '--color-secondary': colors.secondary,
    '--color-accent': colors.accent,
    '--color-paper': colors.paper,
    '--font-heading': fonts.heading,
    '--font-body': fonts.body,
    '--font-mono': fonts.mono,
  };

  return (
    <div className="flex-1 bg-zinc-950 flex flex-col h-screen overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('desktop')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'desktop'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'mobile'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
        <span className="text-zinc-500 text-sm">Live Preview</span>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 overflow-auto p-6 flex justify-center">
        <div
          className={`shadow-2xl transition-all duration-300 overflow-auto ${
            viewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-[900px]'
          }`}
          style={{
            minHeight: viewMode === 'mobile' ? '667px' : 'auto',
            maxHeight: '100%',
            backgroundColor: colors.primary,
          }}
        >
          {/* Generated Page Preview */}
          <div
            style={{
              ...previewStyle,
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-paper)',
              fontFamily: 'var(--font-body)',
              padding: '20px',
              minHeight: '100%',
            }}
          >
            {/* Header */}
            <header style={{ textAlign: 'center', marginBottom: '30px', padding: '30px 0' }}>
              {/* Album Art */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                {epData.tracks.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      background: 'var(--color-secondary)',
                      color: 'var(--color-paper)',
                      padding: '6px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7em',
                      fontStyle: 'italic',
                      letterSpacing: '1px',
                      borderRadius: '3px',
                      transform: 'rotate(8deg)',
                      zIndex: 10,
                    }}
                  >
                    {epData.tracks.length} track{epData.tracks.length !== 1 ? 's' : ''}
                  </span>
                )}
                <div
                  style={{
                    width: viewMode === 'mobile' ? '240px' : '350px',
                    height: viewMode === 'mobile' ? '240px' : '350px',
                    borderRadius: '4px',
                    background: epData.artworkPreview
                      ? `url(${epData.artworkPreview}) center/cover`
                      : 'var(--color-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {!epData.artworkPreview && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8em',
                        opacity: 0.5,
                      }}
                    >
                      Your Art Here
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: viewMode === 'mobile' ? '2em' : '3em',
                  margin: '10px 0',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                {epData.epTitle || 'Your Release Title'}
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1.2em',
                  color: 'var(--color-secondary)',
                }}
              >
                {epData.artistName || 'Artist Name'}
              </p>
              {epData.tagline && (
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85em',
                    color: 'var(--color-accent)',
                    fontStyle: 'italic',
                    marginTop: '8px',
                  }}
                >
                  {epData.tagline}
                </p>
              )}
            </header>

            {/* Tracklist */}
            {epData.tracks.length > 0 && (
              <section
                style={{
                  margin: '20px 0',
                  padding: '20px',
                  background: `linear-gradient(135deg, ${colors.secondary}15 0%, ${colors.primary}20 100%)`,
                  border: `1px solid ${colors.secondary}`,
                  borderRadius: '8px',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1.5em',
                    color: 'var(--color-accent)',
                    borderBottom: `1px solid ${colors.accent}30`,
                    paddingBottom: '8px',
                    marginBottom: '15px',
                    textTransform: 'lowercase',
                  }}
                >
                  listen here
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85em',
                    fontStyle: 'italic',
                    color: 'var(--color-secondary)',
                    textAlign: 'center',
                    marginBottom: '20px',
                  }}
                >
                  Directly from the source
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {epData.tracks.map((track, index) => (
                    <li
                      key={track.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '15px',
                        background:
                          currentTrackIndex === index
                            ? `${colors.secondary}30`
                            : 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '6px',
                        marginBottom: '10px',
                        borderLeft:
                          currentTrackIndex === index
                            ? `3px solid ${colors.secondary}`
                            : '3px solid transparent',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.9em',
                          fontStyle: 'italic',
                          color: 'var(--color-secondary)',
                          minWidth: '24px',
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => playTrack(index)}
                        disabled={!track.audioPreview}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: track.audioPreview
                            ? 'var(--color-secondary)'
                            : `${colors.secondary}50`,
                          border: 'none',
                          cursor: track.audioPreview ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {currentTrackIndex === index && isPlaying ? (
                          <Pause
                            style={{ width: '18px', height: '18px', color: colors.paper }}
                          />
                        ) : (
                          <Play
                            style={{
                              width: '18px',
                              height: '18px',
                              color: colors.paper,
                              marginLeft: '2px',
                            }}
                          />
                        )}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '1.1em',
                            color: 'var(--color-paper)',
                          }}
                        >
                          {track.name || `Track ${index + 1}`}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75em',
                            fontStyle: 'italic',
                            color: 'var(--color-secondary)',
                          }}
                        >
                          {track.duration || '—'}
                        </div>
                      </div>
                      {epData.allowDownload && track.audioFile && (
                        <a
                          href={track.audioPreview}
                          download={`${track.name || `track-${index + 1}`}.${track.audioFile?.name?.split('.').pop() || 'mp3'}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 10px',
                            background: 'var(--color-secondary)',
                            color: 'var(--color-paper)',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7em',
                            fontStyle: 'italic',
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            style={{ width: '12px', height: '12px', fill: 'currentColor' }}
                          >
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                          </svg>
                          .{track.audioFile?.name?.split('.').pop() || 'mp3'}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Now Playing Bar */}
                {currentTrack && (
                  <div
                    style={{
                      background: 'var(--color-primary)',
                      border: `1px solid ${colors.secondary}`,
                      borderRadius: '8px',
                      padding: '15px',
                      marginTop: '20px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7em',
                          fontStyle: 'italic',
                          color: 'var(--color-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}
                      >
                        now playing
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '1em',
                          color: 'var(--color-accent)',
                        }}
                      >
                        {currentTrack.name || `Track ${currentTrackIndex + 1}`}
                      </span>
                    </div>

                    <div
                      onClick={handleProgressClick}
                      style={{
                        width: '100%',
                        height: '6px',
                        background: `${colors.secondary}50`,
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginBottom: '10px',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: 'var(--color-secondary)',
                          borderRadius: '3px',
                          width: duration ? `${(currentTime / duration) * 100}%` : '0%',
                          transition: 'width 0.1s linear',
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75em',
                        fontStyle: 'italic',
                        color: 'var(--color-secondary)',
                      }}
                    >
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>

                    {/* Lyrics Display */}
                    {currentTrack.parsedLyrics && currentTrack.parsedLyrics.length > 0 && (
                      <div
                        style={{
                          padding: '12px 15px',
                          textAlign: 'center',
                          borderTop: `1px solid ${colors.secondary}30`,
                          marginTop: '10px',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.8em',
                            color: 'var(--color-secondary)',
                            opacity: 0.5,
                            marginBottom: '4px',
                          }}
                        >
                          {currentLyricIndex > 0
                            ? currentTrack.parsedLyrics[currentLyricIndex - 1].text
                            : ''}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '1em',
                            color: 'var(--color-accent)',
                          }}
                        >
                          {currentLyricIndex >= 0
                            ? currentTrack.parsedLyrics[currentLyricIndex].text
                            : `${currentTrack.name} — Lyrics`}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.8em',
                            color: 'var(--color-secondary)',
                            opacity: 0.5,
                            marginTop: '4px',
                          }}
                        >
                          {currentLyricIndex >= 0 &&
                          currentLyricIndex < currentTrack.parsedLyrics.length - 1
                            ? currentTrack.parsedLyrics[currentLyricIndex + 1].text
                            : ''}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* About Section */}
            {epData.aboutText && (
              <section
                style={{
                  margin: '20px 0',
                  padding: '20px',
                  background: `${colors.secondary}10`,
                  border: `1px solid ${colors.secondary}`,
                  borderRadius: '8px',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1.5em',
                    color: 'var(--color-accent)',
                    borderBottom: `1px solid ${colors.accent}30`,
                    paddingBottom: '8px',
                    marginBottom: '15px',
                    textTransform: 'lowercase',
                  }}
                >
                  about the release
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1em',
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {epData.aboutText}
                </p>
              </section>
            )}

            {/* Bandcamp Section */}
            {epData.bandcampLink && (
              <section
                style={{
                  margin: '20px 0',
                  padding: '20px',
                  background: `${colors.secondary}10`,
                  border: `1px solid ${colors.secondary}`,
                  borderRadius: '8px',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1.5em',
                    color: 'var(--color-accent)',
                    borderBottom: `1px solid ${colors.accent}30`,
                    paddingBottom: '8px',
                    marginBottom: '15px',
                    textTransform: 'lowercase',
                  }}
                >
                  stream from bandcamp
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <a
                    href={epData.bandcampLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '18px 12px',
                      background: 'var(--color-secondary)',
                      color: 'var(--color-paper)',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9em',
                      minHeight: '90px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: '32px', height: '32px', fill: 'currentColor', marginBottom: '8px' }}>
                      <path d="M0 18.75l7.437-13.5H24l-7.438 13.5H0z"/>
                    </svg>
                    Bandcamp
                    <span style={{ fontSize: '0.75em', opacity: 0.8, marginTop: '4px' }}>+ download</span>
                  </a>
                </div>
              </section>
            )}

            {/* Streaming Links Section */}
            {epData.streamingLinks.filter(l => l.platform && !l.error).length > 0 && (
              <section
                style={{
                  margin: '20px 0',
                  padding: '20px',
                  background: `${colors.secondary}10`,
                  border: `1px solid ${colors.secondary}`,
                  borderRadius: '8px',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1.5em',
                    color: 'var(--color-accent)',
                    borderBottom: `1px solid ${colors.accent}30`,
                    paddingBottom: '8px',
                    marginBottom: '15px',
                    textTransform: 'lowercase',
                  }}
                >
                  {epData.streamingSectionTitle || 'stream from a billionaire'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  {epData.streamingLinks.filter(l => l.platform && !l.error).map((link) => (
                    <StreamingButton key={link.id} link={link} />
                  ))}
                </div>
              </section>
            )}

            {/* Footer */}
            <footer
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85em',
                fontStyle: 'italic',
                textAlign: 'center',
                marginTop: '40px',
                paddingTop: '20px',
                borderTop: `1px solid ${colors.secondary}`,
                color: 'var(--color-accent)',
              }}
            >
              &copy; {new Date().getFullYear()} {epData.artistName || 'Artist Name'}
            </footer>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Sticky Player */}
      {currentTrackIndex !== null && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: colors.primary,
            borderTop: `1px solid ${colors.secondary}`,
            padding: 0,
            zIndex: 1000,
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '12px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* Play/Pause Button */}
              <button
                onClick={togglePlayPause}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: colors.secondary,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isPlaying ? (
                  <Pause style={{ width: '16px', height: '16px', color: colors.paper }} />
                ) : (
                  <Play style={{ width: '16px', height: '16px', color: colors.paper }} />
                )}
              </button>

              {/* Track Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '0.95em',
                    color: colors.paper,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {currentTrack?.name || 'Untitled'}
                </div>
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: '0.7em',
                    fontStyle: 'italic',
                    color: colors.secondary,
                  }}
                >
                  {epData.artistName}
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: '0.7em',
                    fontStyle: 'italic',
                    color: colors.secondary,
                    minWidth: '35px',
                  }}
                >
                  {formatTime(currentTime)}
                </span>
                <div
                  onClick={handleProgressClick}
                  style={{
                    flex: 1,
                    height: '6px',
                    background: `${colors.secondary}50`,
                    borderRadius: '3px',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: colors.secondary,
                      borderRadius: '3px',
                      width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                      transition: 'width 0.1s linear',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: '0.7em',
                    fontStyle: 'italic',
                    color: colors.secondary,
                    minWidth: '35px',
                  }}
                >
                  {formatTime(duration)}
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={closeStickyPlayer}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: `1px solid ${colors.secondary}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  opacity: 0.6,
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: colors.paper }}>
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {/* Lyrics */}
            {currentTrack?.parsedLyrics && currentTrack.parsedLyrics.length > 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '10px 0 0 0',
                  borderTop: `1px solid ${colors.secondary}30`,
                  marginTop: '10px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  {/* Previous Line */}
                  <div
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.75em',
                      color: colors.secondary,
                      opacity: 0.4,
                      lineHeight: 1.3,
                    }}
                  >
                    {currentLyricIndex > 0 ? currentTrack.parsedLyrics[currentLyricIndex - 1]?.text : ''}
                  </div>
                  {/* Current Line */}
                  <div
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.9em',
                      color: colors.accent,
                      lineHeight: 1.3,
                    }}
                  >
                    {currentLyricIndex >= 0 ? currentTrack.parsedLyrics[currentLyricIndex]?.text : ''}
                  </div>
                  {/* Next Line */}
                  <div
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.75em',
                      color: colors.secondary,
                      opacity: 0.4,
                      lineHeight: 1.3,
                    }}
                  >
                    {currentLyricIndex >= 0 && currentLyricIndex < currentTrack.parsedLyrics.length - 1
                      ? currentTrack.parsedLyrics[currentLyricIndex + 1]?.text
                      : ''}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
