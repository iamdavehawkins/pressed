export default function ColorPicker({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-zinc-400 mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 flex-shrink-0">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Click to pick color"
          />
          <div
            className="absolute inset-0 rounded cursor-pointer border-2 border-zinc-600 hover:border-amber-500 transition-colors pointer-events-none"
            style={{ backgroundColor: value }}
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-amber-500 uppercase"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
