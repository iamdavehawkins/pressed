import { useState } from 'react';
import { useEP } from '../context/EPContext';
import { Download, Loader2 } from 'lucide-react';
import JSZip from 'jszip';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const platformSVGs = {
  spotify: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 30.6 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/></svg>`,
  appleMusic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>`,
  youtubeMusic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>`,
  tidal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 9l3-3 3 3-3 3-3-3zm6 0l3-3 3 3-3 3-3-3zm6 0l3-3 3 3-3 3-3-3zm-6 6l3-3 3 3-3 3-3-3z"/></svg>`,
  amazonMusic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5 0 109.5 138.3 114 183.5 43.2 6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32 140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5 40.7-.1 35.5 29.8 35.5 69.1zm0 86.8c0 80-84.2 68-84.2 17.2 0-47.2 50.5-56.7 84.2-57.8v40.6zm136 163.5c-7.7 10-70 67-174.5 67S34.2 408.5 9.7 379c-6.8-7.7 1-11.3 5.5-8.3C88.5 415.2 203 488.5 387.7 401c7.5-3.7 13.3 2 5.5 12zm39.8 2.2c-6.5 15.8-16 26.8-21.2 31-5.5 4.5-9.5 2.7-6.5-3.8s19.3-46.5 12.7-55c-6.5-8.3-37-4.3-48-3.2-10.8 1-13 2-14-.3-2.3-5.7 21.7-15.5 37.5-17.5 15.7-1.8 41-.8 46 5.7 3.7 5.1 0 27.1-6.5 43.1z"/></svg>`,
  behindTheScenes: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
};

const platformLabels = {
  spotify: 'Spotify',
  appleMusic: 'Apple Music',
  youtubeMusic: 'YouTube Music',
  tidal: 'Tidal',
  amazonMusic: 'Amazon Music',
  behindTheScenes: 'Behind the Scenes',
};

function generateStreamingLinksHTML(epData) {
  const validLinks = epData.streamingLinks.filter(l => l.platform && !l.error);
  if (validLinks.length === 0) return '';
  
  const linksHTML = validLinks.map(link => `
                <a href="${link.url}" class="stream-link" target="_blank" rel="noopener" title="${platformLabels[link.platform]}">
                    ${platformSVGs[link.platform]}
                    ${platformLabels[link.platform]}
                </a>`).join('\n');
  
  return `
        <section class="section">
            <h2>${epData.streamingSectionTitle || 'stream from a billionaire'}</h2>
            <div class="stream-grid">
${linksHTML}
            </div>
        </section>
        `;
}

function generateHTML(epData, fontPairs, assets, useBase64 = false) {
  const fonts = fontPairs[epData.fontPair] || fontPairs.serif;
  const colors = epData.colors;
  const year = new Date().getFullYear();

  const artworkSrc = useBase64 && assets.artwork
    ? assets.artwork
    : epData.artwork
    ? 'assets/cover' + getExtension(epData.artwork.name)
    : '';

  const tracksHTML = epData.tracks.map((track, index) => {
    const audioSrc = useBase64 && assets.audio[track.id]
      ? assets.audio[track.id]
      : track.audioFile
      ? `assets/${sanitizeFilename(track.name || `track-${index + 1}`)}${getExtension(track.audioFile.name)}`
      : '';

    const downloadLink = epData.allowDownload && audioSrc
      ? `<a href="${audioSrc}" download class="download-link" aria-label="Download ${track.name || `Track ${index + 1}`}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                        ${getExtension(track.audioFile?.name || '.mp3')}
                    </a>`
      : '';

    return `
                <li class="track" data-src="${audioSrc}" data-index="${index}">
                    <span class="track-number">${String(index + 1).padStart(2, '0')}</span>
                    <button class="play-btn" aria-label="Play ${track.name || `Track ${index + 1}`}">
                        <svg class="icon-play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <svg class="icon-pause" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="display: none;">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                    </button>
                    <div class="track-info">
                        <div class="track-title">${track.name || `Track ${index + 1}`}</div>
                        <div class="track-duration">${track.duration || '—'}</div>
                    </div>
                    ${downloadLink}
                </li>`;
  }).join('\n');

  const lyricsData = {};
  epData.tracks.forEach((track, index) => {
    if (track.parsedLyrics && track.parsedLyrics.length > 0) {
      lyricsData[track.name || `Track ${index + 1}`] = track.parsedLyrics;
    }
  });

  // Generate meta description
  const metaDescription = epData.aboutText 
    ? epData.aboutText.substring(0, 155) + (epData.aboutText.length > 155 ? '...' : '')
    : epData.tagline 
    ? epData.tagline
    : `${epData.epTitle || 'New Release'} by ${epData.artistName || 'Artist'}${epData.tracks.length > 0 ? ` - ${epData.tracks.length} track${epData.tracks.length !== 1 ? 's' : ''}` : ''}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Standard SEO -->
    <title>${epData.epTitle || 'Release'} - ${epData.artistName || 'Artist'}</title>
    <meta name="description" content="${metaDescription}">
    <meta name="author" content="${epData.artistName || 'Artist'}">
    <meta name="keywords" content="${epData.artistName || 'Artist'}, ${epData.epTitle || 'Release'}, music, album, EP">
    
    <!-- Open Graph -->
    <meta property="og:type" content="music.album">
    <meta property="og:title" content="${epData.epTitle || 'Release'} - ${epData.artistName || 'Artist'}">
    <meta property="og:description" content="${metaDescription}">
    ${artworkSrc ? `<meta property="og:image" content="${artworkSrc}">` : ''}
    ${artworkSrc ? `<meta property="og:image:alt" content="${epData.epTitle || 'Album'} artwork by ${epData.artistName || 'Artist'}">` : ''}
    <meta property="og:site_name" content="${epData.artistName || 'Artist'}">
    ${epData.tracks.length > 0 ? `<meta property="music:song_count" content="${epData.tracks.length}">` : ''}
    ${epData.artistName ? `<meta property="music:musician" content="${epData.artistName}">` : ''}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${epData.epTitle || 'Release'} - ${epData.artistName || 'Artist'}">
    <meta name="twitter:description" content="${metaDescription}">
    ${artworkSrc ? `<meta name="twitter:image" content="${artworkSrc}">` : ''}
    ${artworkSrc ? `<meta name="twitter:image:alt" content="${epData.epTitle || 'Album'} artwork">` : ''}
    
    <!-- Favicon -->
    ${artworkSrc ? `<link rel="icon" type="image/png" href="${artworkSrc}">` : ''}
    
    <style>
        :root {
            --color-primary: ${colors.primary};
            --color-secondary: ${colors.secondary};
            --color-accent: ${colors.accent};
            --color-paper: ${colors.paper};
            --font-heading: ${fonts.heading};
            --font-body: ${fonts.body};
            --font-mono: ${fonts.mono};
        }
        
        * { box-sizing: border-box; }
        
        body {
            font-family: var(--font-body);
            background-color: var(--color-primary);
            color: var(--color-paper);
            margin: 0;
            padding: 20px;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            margin-bottom: 30px;
            padding: 30px 0;
        }
        
        .album-art-container {
            position: relative;
            display: inline-block;
            margin-bottom: 20px;
        }
        
        .album-art {
            width: 350px;
            height: 350px;
            border-radius: 4px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            display: block;
            object-fit: cover;
        }
        
        .release-badge {
            position: absolute;
            top: -10px;
            right: -10px;
            background: var(--color-secondary);
            color: var(--color-paper);
            padding: 6px 12px;
            font-family: var(--font-mono);
            font-size: 0.7em;
            font-style: italic;
            letter-spacing: 1px;
            border-radius: 3px;
            transform: rotate(8deg);
        }
        
        h1 {
            font-family: var(--font-heading);
            font-size: 3em;
            margin: 10px 0;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        
        .subtitle {
            font-family: var(--font-body);
            font-size: 1.2em;
            color: var(--color-secondary);
        }
        
        .tagline {
            font-family: var(--font-mono);
            font-size: 0.85em;
            color: var(--color-accent);
            font-style: italic;
            margin-top: 8px;
        }
        
        .section {
            margin: 20px 0;
            padding: 20px;
            background: rgba(79, 106, 137, 0.08);
            border: 1px solid var(--color-secondary);
            border-radius: 8px;
        }
        
        .section h2 {
            font-family: var(--font-body);
            font-size: 1.5em;
            color: var(--color-accent);
            border-bottom: 1px solid rgba(216, 163, 74, 0.3);
            padding-bottom: 8px;
            margin: 0 0 15px 0;
            text-transform: lowercase;
        }
        
        .player-intro {
            font-family: var(--font-mono);
            font-size: 0.85em;
            font-style: italic;
            color: var(--color-secondary);
            margin-bottom: 20px;
            text-align: center;
        }
        
        .tracklist {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .track {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
            margin-bottom: 10px;
            transition: background 0.2s ease;
        }
        
        .track:hover { background: rgba(0, 0, 0, 0.3); }
        
        .track.playing {
            background: rgba(79, 106, 137, 0.2);
            border-left: 3px solid var(--color-secondary);
        }
        
        .track-number {
            font-family: var(--font-mono);
            font-size: 0.9em;
            font-style: italic;
            color: var(--color-secondary);
            min-width: 24px;
        }
        
        .track-info { flex: 1; }
        
        .track-title {
            font-family: var(--font-body);
            font-size: 1.1em;
            color: var(--color-paper);
        }
        
        .track-duration {
            font-family: var(--font-mono);
            font-size: 0.75em;
            font-style: italic;
            color: var(--color-secondary);
        }
        
        .play-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: var(--color-secondary);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
        }
        
        .play-btn:hover {
            background: var(--color-accent);
            transform: scale(1.05);
        }
        
        .play-btn svg {
            width: 18px;
            height: 18px;
            fill: var(--color-paper);
        }
        
        .download-link {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 6px 10px;
            background: var(--color-secondary);
            color: var(--color-paper);
            text-decoration: none;
            border-radius: 4px;
            font-family: var(--font-mono);
            font-size: 0.7em;
            font-style: italic;
            flex-shrink: 0;
            transition: all 0.2s ease;
        }
        
        .download-link:hover {
            background: var(--color-accent);
            color: var(--color-primary);
        }
        
        .download-link svg {
            width: 12px;
            height: 12px;
            fill: currentColor;
        }
        
        .now-playing {
            background: var(--color-primary);
            border: 1px solid var(--color-secondary);
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            display: none;
        }
        
        .now-playing.active { display: block; }
        
        .now-playing-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .now-playing-title {
            font-family: var(--font-body);
            font-size: 1em;
            color: var(--color-accent);
        }
        
        .now-playing-label {
            font-family: var(--font-mono);
            font-size: 0.7em;
            font-style: italic;
            color: var(--color-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .progress-container {
            width: 100%;
            height: 6px;
            background: rgba(79, 106, 137, 0.3);
            border-radius: 3px;
            cursor: pointer;
            margin-bottom: 10px;
        }
        
        .progress-bar {
            height: 100%;
            background: var(--color-secondary);
            border-radius: 3px;
            width: 0%;
            transition: width 0.1s linear;
        }
        
        .time-display {
            display: flex;
            justify-content: space-between;
            font-family: var(--font-mono);
            font-size: 0.75em;
            font-style: italic;
            color: var(--color-secondary);
        }
        
        .lyrics-player {
            display: none;
            padding: 12px 15px;
            text-align: center;
            border-top: 1px solid rgba(79, 106, 137, 0.2);
            margin-top: 10px;
        }
        
        .lyrics-player.active { display: block; }
        
        .lyric-line {
            font-family: var(--font-body);
            transition: all 0.3s ease-out;
            line-height: 1.3;
        }
        
        .lyric-line.prev, .lyric-line.next {
            font-size: 0.8em;
            color: var(--color-secondary);
            opacity: 0.5;
        }
        
        .lyric-line.current {
            font-size: 1em;
            color: var(--color-accent);
            margin: 8px 0;
        }
        
        .about-content {
            font-family: var(--font-body);
            font-size: 1em;
            line-height: 1.8;
        }
        
        .stream-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
            margin-top: 15px;
        }
        
        .stream-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 18px 12px;
            background: var(--color-secondary);
            color: var(--color-paper);
            text-decoration: none;
            border-radius: 8px;
            font-family: var(--font-body);
            font-size: 0.9em;
            transition: all 0.2s ease;
            min-height: 90px;
        }
        
        .stream-link:hover {
            background: var(--color-accent);
            color: var(--color-primary);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(216, 163, 74, 0.3);
        }
        
        .stream-link svg {
            width: 32px;
            height: 32px;
            fill: currentColor;
            margin-bottom: 8px;
        }
        
        .stream-label {
            font-size: 0.75em;
            opacity: 0.8;
            margin-top: 4px;
        }
        
        /* Sticky Bottom Player */
        .sticky-player {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--color-primary);
            border-top: 1px solid var(--color-secondary);
            padding: 0;
            z-index: 1000;
            transform: translateY(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
        }
        
        .sticky-player.active {
            transform: translateY(0);
        }
        
        .sticky-player-inner {
            max-width: 900px;
            margin: 0 auto;
            padding: 12px 20px;
        }
        
        .sticky-player-controls {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .sticky-play-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--color-secondary);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
        }
        
        .sticky-play-btn:hover {
            background: var(--color-accent);
        }
        
        .sticky-play-btn svg {
            width: 16px;
            height: 16px;
            fill: var(--color-paper);
        }
        
        .sticky-play-btn:hover svg {
            fill: var(--color-primary);
        }
        
        .sticky-track-info {
            flex: 1;
            min-width: 0;
        }
        
        .sticky-track-title {
            font-family: var(--font-body);
            font-size: 0.95em;
            color: var(--color-paper);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .sticky-track-artist {
            font-family: var(--font-mono);
            font-size: 0.7em;
            font-style: italic;
            color: var(--color-secondary);
        }
        
        .sticky-progress-container {
            flex: 2;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .sticky-progress-bar-wrapper {
            flex: 1;
            height: 6px;
            background: rgba(79, 106, 137, 0.3);
            border-radius: 3px;
            cursor: pointer;
        }
        
        .sticky-progress-bar {
            height: 100%;
            background: var(--color-secondary);
            border-radius: 3px;
            width: 0%;
            transition: width 0.1s linear;
        }
        
        .sticky-time {
            font-family: var(--font-mono);
            font-size: 0.7em;
            font-style: italic;
            color: var(--color-secondary);
            min-width: 35px;
        }
        
        .sticky-close-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: transparent;
            border: 1px solid var(--color-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
            opacity: 0.6;
        }
        
        .sticky-close-btn:hover {
            background: var(--color-secondary);
            border-color: var(--color-secondary);
            opacity: 1;
        }
        
        .sticky-close-btn svg {
            width: 14px;
            height: 14px;
            fill: var(--color-paper);
        }
        
        .sticky-lyrics {
            text-align: center;
            padding: 10px 0 0 0;
            border-top: 1px solid rgba(79, 106, 137, 0.2);
            margin-top: 10px;
            display: none;
        }
        
        .sticky-lyrics.active {
            display: block;
        }
        
        .sticky-lyrics-scroll {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
        }
        
        .sticky-lyric-line {
            font-family: var(--font-body);
            transition: all 0.3s ease-out;
            line-height: 1.3;
        }
        
        .sticky-lyric-line.prev {
            font-size: 0.75em;
            color: var(--color-secondary);
            opacity: 0.4;
        }
        
        .sticky-lyric-line.current {
            font-size: 0.9em;
            color: var(--color-accent);
        }
        
        .sticky-lyric-line.next {
            font-size: 0.75em;
            color: var(--color-secondary);
            opacity: 0.4;
        }
        
        body.player-active {
            padding-bottom: 120px;
        }
        
        .download-section {
            background: linear-gradient(135deg, rgba(216, 163, 74, 0.1) 0%, rgba(155, 74, 52, 0.08) 100%);
            border: 1px solid var(--color-accent);
        }
        
        .download-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
        }
        
        .download-track {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
            gap: 10px;
        }
        
        .download-track-title {
            font-family: var(--font-body);
            font-size: 0.95em;
        }
        
        .download-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            background: var(--color-secondary);
            color: var(--color-paper);
            text-decoration: none;
            border-radius: 4px;
            font-family: var(--font-mono);
            font-size: 0.75em;
            font-style: italic;
            transition: all 0.2s ease;
        }
        
        .download-btn:hover {
            background: var(--color-accent);
            color: var(--color-primary);
        }
        
        .download-btn svg {
            width: 14px;
            height: 14px;
            fill: currentColor;
        }
        
        footer {
            font-family: var(--font-mono);
            font-size: 0.85em;
            font-style: italic;
            text-align: center;
            margin-top: 40px;
            padding: 20px 0;
            border-top: 1px solid var(--color-secondary);
            color: var(--color-accent);
        }
        
        @media (max-width: 768px) {
            body { padding: 15px; }
            h1 { font-size: 2em; }
            .album-art { width: 280px; height: 280px; }
            .track { padding: 12px; gap: 10px; }
        }
    </style>
</head>
<body>
    <header>
        <div class="album-art-container">
            ${epData.tracks.length > 0 ? `<span class="release-badge">${epData.tracks.length} track${epData.tracks.length !== 1 ? 's' : ''}</span>` : ''}
            ${artworkSrc ? `<img src="${artworkSrc}" alt="${epData.epTitle} Album Cover" class="album-art">` : ''}
        </div>
        <h1>${epData.epTitle || 'Your Release Title'}</h1>
        <p class="subtitle">${epData.artistName || 'Artist Name'}</p>
        ${epData.tagline ? `<p class="tagline">${epData.tagline}</p>` : ''}
    </header>

    <main>
        ${epData.tracks.length > 0 ? `
        <section class="section player-section">
            <h2>listen here</h2>
            <p class="player-intro">Directly from the source</p>
            
            <ul class="tracklist">
${tracksHTML}
            </ul>
            
            <div class="now-playing" id="nowPlaying">
                <div class="now-playing-header">
                    <span class="now-playing-label">now playing</span>
                    <span class="now-playing-title" id="nowPlayingTitle">—</span>
                </div>
                <div class="progress-container" id="progressContainer">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
                <div class="time-display">
                    <span id="currentTime">0:00</span>
                    <span id="totalTime">0:00</span>
                </div>
                <div class="lyrics-player" id="lyricsPlayer">
                    <div class="lyric-line prev" id="lyricPrev"></div>
                    <div class="lyric-line current" id="lyricCurrent"></div>
                    <div class="lyric-line next" id="lyricNext"></div>
                </div>
            </div>
        </section>
        ` : ''}


        ${epData.aboutText ? `
        <section class="section">
            <h2>about the release</h2>
            <div class="about-content">
                <p>${epData.aboutText}</p>
            </div>
        </section>
        ` : ''}

        ${epData.bandcampLink ? `
        <section class="section">
            <h2>stream from bandcamp</h2>
            <div class="stream-grid">
                <a href="${epData.bandcampLink}" class="stream-link" target="_blank" rel="noopener" title="Bandcamp">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M0 18.75l7.437-13.5H24l-7.438 13.5H0z"/>
                    </svg>
                    Bandcamp
                    <span class="stream-label">+ download</span>
                </a>
            </div>
        </section>
        ` : ''}

        ${generateStreamingLinksHTML(epData)}
    </main>

    <footer>
        <p>&copy; ${year} ${epData.artistName || 'Artist Name'}</p>
    </footer>

    <!-- Sticky Bottom Player -->
    <div class="sticky-player" id="stickyPlayer">
        <div class="sticky-player-inner">
            <div class="sticky-player-controls">
                <button class="sticky-play-btn" id="stickyPlayBtn" aria-label="Play/Pause">
                    <svg class="sticky-icon-play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg class="sticky-icon-pause" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="display: none;">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                </button>
                <div class="sticky-track-info">
                    <div class="sticky-track-title" id="stickyTrackTitle">—</div>
                    <div class="sticky-track-artist">${epData.artistName || 'Artist'}</div>
                </div>
                <div class="sticky-progress-container">
                    <span class="sticky-time" id="stickyCurrentTime">0:00</span>
                    <div class="sticky-progress-bar-wrapper" id="stickyProgressWrapper">
                        <div class="sticky-progress-bar" id="stickyProgressBar"></div>
                    </div>
                    <span class="sticky-time" id="stickyTotalTime">0:00</span>
                </div>
                <button class="sticky-close-btn" id="stickyCloseBtn" aria-label="Close player">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
            <div class="sticky-lyrics" id="stickyLyrics">
                <div class="sticky-lyrics-scroll">
                    <div class="sticky-lyric-line prev" id="stickyLyricPrev"></div>
                    <div class="sticky-lyric-line current" id="stickyLyricCurrent"></div>
                    <div class="sticky-lyric-line next" id="stickyLyricNext"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const audio = new Audio();
        let currentTrack = null;
        const artistName = "${epData.artistName || 'Artist'}";
        const releaseTitle = "${epData.epTitle || 'Release'}";
        const albumArtSrc = "${artworkSrc || ''}";
        
        const allLyrics = ${JSON.stringify(lyricsData, null, 2)};
        
        let currentLyricIndex = -1;
        let currentLyrics = null;
        let currentSongTitle = null;
        
        const nowPlaying = document.getElementById('nowPlaying');
        const nowPlayingTitle = document.getElementById('nowPlayingTitle');
        const progressBar = document.getElementById('progressBar');
        const progressContainer = document.getElementById('progressContainer');
        const currentTimeEl = document.getElementById('currentTime');
        const totalTimeEl = document.getElementById('totalTime');
        const lyricsPlayer = document.getElementById('lyricsPlayer');
        const lyricPrev = document.getElementById('lyricPrev');
        const lyricCurrent = document.getElementById('lyricCurrent');
        const lyricNext = document.getElementById('lyricNext');
        
        // Sticky player elements
        const stickyPlayer = document.getElementById('stickyPlayer');
        const stickyPlayBtn = document.getElementById('stickyPlayBtn');
        const stickyTrackTitle = document.getElementById('stickyTrackTitle');
        const stickyProgressBar = document.getElementById('stickyProgressBar');
        const stickyProgressWrapper = document.getElementById('stickyProgressWrapper');
        const stickyCurrentTime = document.getElementById('stickyCurrentTime');
        const stickyTotalTime = document.getElementById('stickyTotalTime');
        const stickyCloseBtn = document.getElementById('stickyCloseBtn');
        const stickyLyrics = document.getElementById('stickyLyrics');
        const stickyLyricPrev = document.getElementById('stickyLyricPrev');
        const stickyLyricCurrent = document.getElementById('stickyLyricCurrent');
        const stickyLyricNext = document.getElementById('stickyLyricNext');
        const stickyIconPlay = document.querySelector('.sticky-icon-play');
        const stickyIconPause = document.querySelector('.sticky-icon-pause');
        
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return mins + ':' + secs.toString().padStart(2, '0');
        }
        
        function getCurrentLyricIndex(time) {
            if (!currentLyrics) return -1;
            for (let i = currentLyrics.length - 1; i >= 0; i--) {
                if (time >= currentLyrics[i].time) return i;
            }
            return -1;
        }
        
        function updateLyrics(time) {
            if (!currentLyrics) return;
            const newIndex = getCurrentLyricIndex(time);
            if (newIndex !== currentLyricIndex) {
                currentLyricIndex = newIndex;
                lyricPrev.textContent = currentLyricIndex > 0 ? currentLyrics[currentLyricIndex - 1].text : '';
                lyricCurrent.textContent = currentLyricIndex >= 0 ? currentLyrics[currentLyricIndex].text : currentSongTitle + ' — Lyrics';
                lyricNext.textContent = (currentLyricIndex >= 0 && currentLyricIndex < currentLyrics.length - 1) ? currentLyrics[currentLyricIndex + 1].text : '';
                
                // Update sticky lyrics
                if (stickyLyrics.classList.contains('active')) {
                    stickyLyricPrev.textContent = currentLyricIndex > 0 ? currentLyrics[currentLyricIndex - 1].text : '';
                    stickyLyricCurrent.textContent = currentLyricIndex >= 0 ? currentLyrics[currentLyricIndex].text : '';
                    stickyLyricNext.textContent = (currentLyricIndex >= 0 && currentLyricIndex < currentLyrics.length - 1) ? currentLyrics[currentLyricIndex + 1].text : '';
                }
            }
        }
        
        function updateProgress() {
            if (audio.duration) {
                progressBar.style.width = (audio.currentTime / audio.duration) * 100 + '%';
                currentTimeEl.textContent = formatTime(audio.currentTime);
                totalTimeEl.textContent = formatTime(audio.duration);
                
                // Update sticky player progress
                stickyProgressBar.style.width = (audio.currentTime / audio.duration) * 100 + '%';
                stickyCurrentTime.textContent = formatTime(audio.currentTime);
                stickyTotalTime.textContent = formatTime(audio.duration);
                
                if (currentLyrics) updateLyrics(audio.currentTime);
            }
        }
        
        function showStickyPlayer(title) {
            stickyPlayer.classList.add('active');
            document.body.classList.add('player-active');
            stickyTrackTitle.textContent = title;
            stickyIconPlay.style.display = 'none';
            stickyIconPause.style.display = 'block';
            
            if (currentLyrics) {
                stickyLyrics.classList.add('active');
            } else {
                stickyLyrics.classList.remove('active');
            }
        }
        
        function hideStickyPlayer() {
            stickyPlayer.classList.remove('active');
            document.body.classList.remove('player-active');
            stickyLyrics.classList.remove('active');
        }
        
        function updateStickyPlayPauseIcon() {
            if (audio.paused) {
                stickyIconPlay.style.display = 'block';
                stickyIconPause.style.display = 'none';
            } else {
                stickyIconPlay.style.display = 'none';
                stickyIconPause.style.display = 'block';
            }
        }
        
        function playTrack(trackEl) {
            const src = trackEl.dataset.src;
            const title = trackEl.querySelector('.track-title').textContent;
            
            document.querySelectorAll('.track').forEach(t => {
                t.classList.remove('playing');
                t.querySelector('.icon-play').style.display = 'block';
                t.querySelector('.icon-pause').style.display = 'none';
            });
            
            if (currentTrack === trackEl && !audio.paused) {
                audio.pause();
                trackEl.querySelector('.icon-play').style.display = 'block';
                trackEl.querySelector('.icon-pause').style.display = 'none';
                return;
            }
            
            if (currentTrack !== trackEl) {
                audio.src = src;
                currentTrack = trackEl;
                currentLyricIndex = -1;
                currentSongTitle = title;
                
                if (allLyrics[title]) {
                    currentLyrics = allLyrics[title];
                    lyricsPlayer.classList.add('active');
                    currentLyricIndex = -2;
                    updateLyrics(0);
                } else {
                    currentLyrics = null;
                    lyricsPlayer.classList.remove('active');
                }
            }
            
            audio.play();
            trackEl.classList.add('playing');
            trackEl.querySelector('.icon-play').style.display = 'none';
            trackEl.querySelector('.icon-pause').style.display = 'block';
            nowPlaying.classList.add('active');
            nowPlayingTitle.textContent = title;
            
            // Update Media Session API for lock screen and Bluetooth displays
            if ('mediaSession' in navigator && albumArtSrc) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: title,
                    artist: artistName,
                    album: releaseTitle,
                    artwork: [
                        { src: albumArtSrc, sizes: '512x512', type: 'image/png' },
                        { src: albumArtSrc, sizes: '256x256', type: 'image/png' },
                        { src: albumArtSrc, sizes: '128x128', type: 'image/png' }
                    ]
                });
            }
            
            // Show sticky player
            showStickyPlayer(title);
        }
        
        document.querySelectorAll('.track .play-btn').forEach(btn => {
            btn.addEventListener('click', () => playTrack(btn.closest('.track')));
        });
        
        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                if (audio.duration) {
                    const rect = progressContainer.getBoundingClientRect();
                    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
                }
            });
        }
        
        // Sticky player controls
        stickyPlayBtn.addEventListener('click', () => {
            if (currentTrack) {
                if (audio.paused) {
                    audio.play();
                    currentTrack.querySelector('.icon-play').style.display = 'none';
                    currentTrack.querySelector('.icon-pause').style.display = 'block';
                } else {
                    audio.pause();
                    currentTrack.querySelector('.icon-play').style.display = 'block';
                    currentTrack.querySelector('.icon-pause').style.display = 'none';
                }
                updateStickyPlayPauseIcon();
            }
        });
        
        stickyProgressWrapper.addEventListener('click', (e) => {
            if (audio.duration) {
                const rect = stickyProgressWrapper.getBoundingClientRect();
                audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
            }
        });
        
        stickyCloseBtn.addEventListener('click', () => {
            audio.pause();
            audio.currentTime = 0;
            if (currentTrack) {
                currentTrack.classList.remove('playing');
                currentTrack.querySelector('.icon-play').style.display = 'block';
                currentTrack.querySelector('.icon-pause').style.display = 'none';
            }
            nowPlaying.classList.remove('active');
            lyricsPlayer.classList.remove('active');
            hideStickyPlayer();
            currentTrack = null;
            currentLyrics = null;
        });
        
        audio.addEventListener('timeupdate', updateProgress);
        
        audio.addEventListener('play', updateStickyPlayPauseIcon);
        audio.addEventListener('pause', updateStickyPlayPauseIcon);
        
        audio.addEventListener('ended', () => {
            const tracks = Array.from(document.querySelectorAll('.track'));
            const currentIndex = tracks.indexOf(currentTrack);
            if (currentIndex < tracks.length - 1) {
                playTrack(tracks[currentIndex + 1]);
            } else {
                currentTrack.classList.remove('playing');
                currentTrack.querySelector('.icon-play').style.display = 'block';
                currentTrack.querySelector('.icon-pause').style.display = 'none';
                nowPlaying.classList.remove('active');
                lyricsPlayer.classList.remove('active');
                hideStickyPlayer();
                currentTrack = null;
                currentLyrics = null;
            }
        });
    </script>
</body>
</html>`;
}

function getExtension(filename) {
  if (!filename) return '.mp3';
  const ext = filename.substring(filename.lastIndexOf('.'));
  return ext || '.mp3';
}

function sanitizeFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function generateReadme(epData) {
  return `# ${epData.epTitle || 'Release'} - ${epData.artistName || 'Artist'}

This is your Music landing page, generated with Pressed.

## Deploying to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up/log in
2. Drag and drop this entire folder onto the Netlify dashboard
3. Your site is live!

## Deploying to GitHub Pages

1. Create a new repository on GitHub
2. Upload all files from this folder
3. Go to Settings > Pages > Select "main" branch
4. Your site will be available at \`https://[username].github.io/[repo-name]\`

## Deploying to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/log in
2. Click "Add New Project"
3. Upload this folder or connect your GitHub repo
4. Your site is live!

---
Generated with Pressed - Privacy First Music landing page Generator
`;
}

export default function ExportButton() {
  const { epData, fontPairs } = useEP();
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const zip = new JSZip();
      const assets = { artwork: null, audio: {} };

      const html = generateHTML(epData, fontPairs, assets, false);
      zip.file('index.html', html);
      zip.file('README.md', generateReadme(epData));

      const assetsFolder = zip.folder('assets');

      if (epData.artwork) {
        const artworkBuffer = await epData.artwork.arrayBuffer();
        assetsFolder.file('cover' + getExtension(epData.artwork.name), artworkBuffer);
      }

      for (const track of epData.tracks) {
        if (track.audioFile) {
          const audioBuffer = await track.audioFile.arrayBuffer();
          const filename = sanitizeFilename(track.name || `track-${epData.tracks.indexOf(track) + 1}`) + getExtension(track.audioFile.name);
          assetsFolder.file(filename, audioBuffer);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizeFilename(epData.epTitle || 'release')}-landing-page.zip`;
      a.click();
      URL.revokeObjectURL(url);

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const isReady = epData.artistName && epData.epTitle && epData.tracks.length > 0;

  return (
    <>
      <button
        onClick={handleExport}
        disabled={!isReady || isExporting}
        className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors ${
          isReady && !isExporting
            ? 'bg-amber-600 hover:bg-amber-500 text-white'
            : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
        }`}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download ZIP
          </>
        )}
      </button>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-md w-full border border-zinc-800">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Export Successful</h3>
              </div>
              
              <p className="text-zinc-400 mb-6">
                Your landing page has been downloaded. Deploy it in under 30 seconds:
              </p>

              <div className="space-y-3 mb-6">
                <a
                  href="https://app.netlify.com/drop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-zinc-800 hover:bg-zinc-750 rounded-lg border border-zinc-700 hover:border-amber-500 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white mb-1">Netlify Drop</div>
                      <div className="text-sm text-zinc-400">Drag & drop your ZIP file</div>
                    </div>
                    <svg className="w-5 h-5 text-zinc-500 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>

                <a
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-zinc-800 hover:bg-zinc-750 rounded-lg border border-zinc-700 hover:border-amber-500 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white mb-1">Vercel</div>
                      <div className="text-sm text-zinc-400">Upload or connect to GitHub</div>
                    </div>
                    <svg className="w-5 h-5 text-zinc-500 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              </div>

              <p className="text-xs text-zinc-500 mb-4">
                Both platforms offer free hosting with custom domains
              </p>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
