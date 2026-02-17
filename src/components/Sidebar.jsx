import { useEP } from '../context/EPContext';
import { Plus, Trash2, GripVertical, Upload, Music, FileText, RotateCcw, Save, Clock } from 'lucide-react';
import { useRef } from 'react';
import ColorPicker from './ColorPicker';

function parseLRC(lrcContent) {
  const lines = lrcContent.split('\n');
  const lyrics = [];
  
  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.+)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = parseInt(match[3], 10);
      const time = minutes * 60 + seconds + ms / (match[3].length === 2 ? 100 : 1000);
      const text = match[4].trim();
      if (text) {
        lyrics.push({ time, text });
      }
    }
  }
  
  return lyrics.sort((a, b) => a.time - b.time);
}

function TrackItem({ track, index }) {
  const { updateTrack, removeTrack } = useEP();
  const audioInputRef = useRef(null);
  const lrcInputRef = useRef(null);

  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      const audio = new Audio(preview);
      audio.addEventListener('loadedmetadata', () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        updateTrack(track.id, 'duration', `${mins}:${secs.toString().padStart(2, '0')}`);
      });
      updateTrack(track.id, 'audioFile', file);
      updateTrack(track.id, 'audioPreview', preview);
    }
  };

  const handleLRCUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        const parsed = parseLRC(content);
        updateTrack(track.id, 'lyricsFile', file);
        updateTrack(track.id, 'parsedLyrics', parsed);
        updateTrack(track.id, 'lyricsType', 'lrc');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
      <div className="flex items-center gap-2 mb-3">
        <GripVertical className="w-4 h-4 text-zinc-500 cursor-grab" />
        <span className="text-zinc-400 text-sm font-mono">
          {String(index + 1).padStart(2, '0')}
        </span>
        <input
          type="text"
          value={track.name}
          onChange={(e) => updateTrack(track.id, 'name', e.target.value)}
          placeholder="Track Name"
          className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={() => removeTrack(track.id)}
          className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <input
        type="text"
        value={track.description}
        onChange={(e) => updateTrack(track.id, 'description', e.target.value)}
        placeholder="Short description (optional)"
        className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-1.5 text-white text-sm mb-3 focus:outline-none focus:border-amber-500"
      />

      <div className="grid grid-cols-2 gap-2 mb-3">
        <input
          ref={audioInputRef}
          type="file"
          accept=".mp3,.wav"
          onChange={handleAudioUpload}
          className="hidden"
        />
        <button
          onClick={() => audioInputRef.current?.click()}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
            track.audioFile
              ? 'bg-green-900/50 border border-green-700 text-green-300'
              : 'bg-zinc-700 border border-zinc-600 text-zinc-300 hover:bg-zinc-600'
          }`}
        >
          <Music className="w-4 h-4" />
          {track.audioFile ? 'Audio Added' : 'Upload Audio'}
        </button>

        <input
          ref={lrcInputRef}
          type="file"
          accept=".lrc"
          onChange={handleLRCUpload}
          className="hidden"
        />
        <button
          onClick={() => lrcInputRef.current?.click()}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
            track.lyricsType === 'lrc'
              ? 'bg-green-900/50 border border-green-700 text-green-300'
              : 'bg-zinc-700 border border-zinc-600 text-zinc-300 hover:bg-zinc-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          {track.lyricsType === 'lrc' ? 'LRC Added' : 'Upload .lrc'}
        </button>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Plain Text Lyrics (optional)</label>
        <textarea
          value={track.lyricsText}
          onChange={(e) => {
            updateTrack(track.id, 'lyricsText', e.target.value);
            if (e.target.value && track.lyricsType !== 'lrc') {
              updateTrack(track.id, 'lyricsType', 'text');
            } else if (!e.target.value && track.lyricsType === 'text') {
              updateTrack(track.id, 'lyricsType', 'none');
            }
          }}
          placeholder="Paste lyrics here..."
          rows={3}
          className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 resize-none"
        />
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { epData, fontPairs, updateField, updateColor, addTrack, setArtwork, addStreamingLink, updateStreamingLink, removeStreamingLink, resetProject, lastSaveTime, isSaving } = useEP();
  const artworkInputRef = useRef(null);

  const handleArtworkUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArtwork(file);
    }
  };

  const formatSaveTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <aside className="w-96 bg-zinc-900 border-r border-zinc-800 h-screen overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-amber-500">●</span> Pressed
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={resetProject}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors border border-transparent hover:border-red-800"
              title="Reset Project (clears all data)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Save Status Indicator */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {isSaving ? (
            <>
              <Save className="w-3 h-3 animate-pulse" />
              <span>Saving...</span>
            </>
          ) : lastSaveTime ? (
            <>
              <Clock className="w-3 h-3" />
              <span>Saved {formatSaveTime(lastSaveTime)}</span>
            </>
          ) : (
            <>
              <Save className="w-3 h-3" />
              <span>Auto-save enabled</span>
            </>
          )}
        </div>
        <p className="text-zinc-400 text-sm mt-1">Music landing page Generator</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Global Meta */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
            Release Details
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Artist Name</label>
              <input
                type="text"
                value={epData.artistName}
                onChange={(e) => updateField('artistName', e.target.value)}
                placeholder="Your Name"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Release Title</label>
              <input
                type="text"
                value={epData.epTitle}
                onChange={(e) => updateField('epTitle', e.target.value)}
                placeholder="Album Title"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Tagline</label>
              <input
                type="text"
                value={epData.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                placeholder="A short description of your release"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </section>

        {/* Artwork */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
            Artwork
          </h2>
          <input
            ref={artworkInputRef}
            type="file"
            accept="image/*"
            onChange={handleArtworkUpload}
            className="hidden"
          />
          <button
            onClick={() => artworkInputRef.current?.click()}
            className="w-full aspect-square bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-amber-500 transition-colors overflow-hidden"
          >
            {epData.artworkPreview ? (
              <img
                src={epData.artworkPreview}
                alt="Album artwork"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Upload className="w-8 h-8 text-zinc-500" />
                <span className="text-zinc-400 text-sm">Upload Album Art</span>
                <span className="text-zinc-500 text-xs">Recommended: 1400x1400</span>
              </>
            )}
          </button>
        </section>

        {/* Style Controls */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
            Style
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Font Pair</label>
              <select
                value={epData.fontPair}
                onChange={(e) => updateField('fontPair', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {Object.entries(fontPairs).map(([key, pair]) => (
                  <option key={key} value={key}>
                    {pair.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ColorPicker
                label="Background"
                value={epData.colors.primary}
                onChange={(value) => updateColor('primary', value)}
              />
              <ColorPicker
                label="Secondary"
                value={epData.colors.secondary}
                onChange={(value) => updateColor('secondary', value)}
              />
              <ColorPicker
                label="Accent"
                value={epData.colors.accent}
                onChange={(value) => updateColor('accent', value)}
              />
              <ColorPicker
                label="Text"
                value={epData.colors.paper}
                onChange={(value) => updateColor('paper', value)}
              />
            </div>
          </div>
        </section>

        {/* Track Manager */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Tracks ({epData.tracks.length})
            </h2>
            {epData.tracks.length === 0 && (
              <button
                onClick={addTrack}
                className="flex items-center gap-1 px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Track
              </button>
            )}
          </div>
          <div className="space-y-3">
            {epData.tracks.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No tracks yet. Click "Add Track" to begin.
              </div>
            ) : (
              <>
                {epData.tracks.map((track, index) => (
                  <TrackItem key={track.id} track={track} index={index} />
                ))}
                <button
                  onClick={addTrack}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Track
                </button>
              </>
            )}
          </div>
        </section>

        {/* About Section */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
            About
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">About the Release</label>
              <textarea
                value={epData.aboutText}
                onChange={(e) => updateField('aboutText', e.target.value)}
                placeholder="Tell the story behind your music..."
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowDownload"
                checked={epData.allowDownload}
                onChange={(e) => updateField('allowDownload', e.target.checked)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-amber-600 focus:ring-amber-500 focus:ring-offset-zinc-900 cursor-pointer"
              />
              <label htmlFor="allowDownload" className="text-sm text-zinc-300 cursor-pointer">
                Allow track downloads?
              </label>
            </div>
          </div>
        </section>

        {/* Streaming Links */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
            Streaming Links
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Bandcamp Link</label>
              <input
                type="url"
                value={epData.bandcampLink}
                onChange={(e) => updateField('bandcampLink', e.target.value)}
                placeholder="https://yourname.bandcamp.com/album/..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Section Title</label>
              <input
                type="text"
                value={epData.streamingSectionTitle}
                onChange={(e) => updateField('streamingSectionTitle', e.target.value)}
                placeholder="stream from a billionaire"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-zinc-400">Platform Links</label>
                <button
                  onClick={addStreamingLink}
                  className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Link
                </button>
              </div>
              {epData.streamingLinks.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No streaming links added</p>
              ) : (
                <div className="space-y-2">
                  {epData.streamingLinks.map((link) => (
                    <div key={link.id} className="space-y-1">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateStreamingLink(link.id, e.target.value)}
                          placeholder="https://open.spotify.com/..."
                          className={`flex-1 bg-zinc-800 border rounded px-3 py-2 text-white text-sm focus:outline-none ${
                            link.error ? 'border-red-500' : 'border-zinc-700 focus:border-amber-500'
                          }`}
                        />
                        <button
                          onClick={() => removeStreamingLink(link.id)}
                          className="p-2 text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {link.error && (
                        <p className="text-xs text-red-400">{link.error}</p>
                      )}
                      {link.platform && !link.error && (
                        <p className="text-xs text-green-400 capitalize">✓ {link.platform.replace(/([A-Z])/g, ' $1').trim()}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 text-center text-xs text-zinc-500">
        Privacy First — Your music stays in your browser
      </div>
    </aside>
  );
}
