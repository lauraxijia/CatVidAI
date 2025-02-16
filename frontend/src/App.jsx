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
        <Box minH="100vh" bg="gray.50">
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
