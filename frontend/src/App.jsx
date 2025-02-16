import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import AnalyzerPage from './pages/AnalyzerPage'
import EditorPage from './pages/EditorPage'
import MemeMakerPage from './pages/MemeMakerPage'

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box 
          minH="100vh" 
          bgGradient="linear(to-r, pink.100, purple.100)"
          sx={{
            background: "linear-gradient(45deg, #ffebee 0%, #f3e5f5 100%)",
            backgroundSize: "20px 20px",
            backgroundImage: `
              radial-gradient(circle at 1px 1px, pink 2px, transparent 0)
            `
          }}
        >
          <Navbar />
          <Box maxW="1200px" mx="auto" px={4} py={8}>
            <Routes>
              <Route path="/" element={<AnalyzerPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/memes" element={<MemeMakerPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  )
}

export default App
