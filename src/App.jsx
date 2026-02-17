import { EPProvider } from './context/EPContext'
import Sidebar from './components/Sidebar'
import Preview from './components/Preview'
import ExportButton from './components/ExportButton'

function App() {
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
