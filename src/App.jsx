import { Routes, Route } from 'react-router-dom'
import { useHandle } from './hooks/useHandle'
import Navbar from './components/Navbar'
import HandleModal from './components/HandleModal'
import Footer from './components/Footer'
import Home from './pages/Home'
import Problems from './pages/Problems'
import ProblemDetail from './pages/ProblemDetail'
import Profile from './pages/Profile'
import About from './pages/About'

export default function App() {
  const { handle, needsHandle, save, setNeedsHandle } = useHandle()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      {needsHandle && (
        <HandleModal
          onSave={(h) => {
            save(h)
            setNeedsHandle(false)
          }}
        />
      )}
    </div>
  )
}