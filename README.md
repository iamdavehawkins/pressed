# Pressed - Music landing page Generator

Create beautiful, minimalist Music landing pages inspired by analog aesthetics. Privacy first — your music stays in your browser.

## Features

- **Real-time Preview**: See changes instantly as you build
- **Responsive Design Toggle**: Preview in desktop or mobile view
- **Audio Player**: Built-in player with progress bar and track navigation
- **LRC Lyrics Support**: Upload .lrc files for synced lyrics display
- **Customizable Styling**: Choose from curated font pairs and custom colors
- **Export Options**:
  - **ZIP Bundle**: Complete folder with index.html, assets, and deployment README
  - **Single HTML**: Self-contained monolith file with Base64-encoded assets
- **No Backend**: All processing happens client-side

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## How to Use

1. **Release Details**: Enter your artist name, release title, tagline, and about text
2. **Artwork**: Upload your album cover (recommended 1400x1400)
3. **Style**: Choose a font pair and customize your color palette
4. **Tracks**: Add tracks with audio files (.mp3/.wav) and optional lyrics (.lrc)
5. **Preview**: See your page update in real-time
6. **Export**: Download your site as a ZIP or single HTML file

## Deployment

While on the main branch, run `npm run deploy` to deploy to GitHub Pages.
The exported site can be deployed to:

- **Netlify**: Drag and drop the folder
- **Vercel**: Upload or connect GitHub repo
- **GitHub Pages**: Push to a repository and enable Pages

## Tech Stack

- React + Vite
- Tailwind CSS
- JSZip for export
- Lucide React for icons

## Inspiration

Inspired by [halfaliveep](https://halfaliveep.iamdavehawkins.com) — minimalist, typography-focused, analog-inspired Music landing pages.

---

*Privacy First — Your music never leaves your browser.*
