import { useState, useEffect } from 'react'
import { EPProvider } from './context/EPContext'
import Sidebar from './components/Sidebar'
import Preview from './components/Preview'
import ExportButton from './components/ExportButton'
import { Monitor } from 'lucide-react'

function MobileBlockScreen({ onContinue }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
            <Monitor className="w-8 h-8 text-zinc-400" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-white mb-3">
          Desktop Only
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-6">
          This app is designed for larger screens. Please come back on a desktop or laptop computer for the best experience.
        </p>
        <div className="inline-flex items-center gap-2 text-zinc-500 text-sm mb-6">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
          Waiting for a bigger screen....
        </div>
        <button
          onClick={onContinue}
          className="text-zinc-500 hover:text-zinc-300 text-sm underline transition-colors"
        >
          Continue anyway
        </button>
      </div>
    </div>
  )
}

function App() {
  const [isMobile, setIsMobile] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [forceDesktop, setForceDesktop] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      setIsChecked(true)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isChecked) {
    return null
  }

  if (isMobile && !forceDesktop) {
    return <MobileBlockScreen onContinue={() => setForceDesktop(true)} />
  }

  return (
    <EPProvider>
      <div className="flex h-screen bg-zinc-950 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              <span className="text-zinc-400 text-sm">Preview your Music landing page</span>
            </div>
            <ExportButton />
          </div>
          <Preview />
        </div>
      </div>
    </EPProvider>
  )
}

export default App
