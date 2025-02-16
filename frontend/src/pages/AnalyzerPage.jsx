import { useState } from 'react'
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Progress,
  Card,
  CardBody,
  Icon,
  Heading,
} from '@chakra-ui/react'
import { FiUpload } from 'react-icons/fi'
import axios from 'axios'

const AnalyzerPage = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const toast = useToast()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type.includes('video')) {
      setFile(selectedFile)
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please select a video file',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('video', file)
    setUploading(true)

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData)
      setAnalysis(response.data.analysis)
      toast({
        title: 'Success!',
        description: 'Video analyzed successfully',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to analyze video',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <VStack spacing={8} align="stretch">
      <Box textAlign="center">
        <Heading size="2xl" mb={3}>Cat Sound Analyzer</Heading>
        <Text color="gray.600" fontSize="xl">Upload a video to analyze your cat's mood</Text>
      </Box>

      <Card variant="outline" maxW="600px" mx="auto">
        <CardBody>
          <VStack spacing={6}>
            <Box
              border="2px dashed"
              borderColor="purple.200"
              borderRadius="lg"
              p={10}
              w="100%"
              textAlign="center"
              bg="purple.50"
              cursor="pointer"
              onClick={() => document.getElementById('fileInput').click()}
            >
              <Icon as={FiUpload} w={12} h={12} color="purple.500" mb={4} />
              <Text fontWeight="medium" fontSize="lg">
                {file ? file.name : 'Click to upload or drag and drop'}
              </Text>
              <input
                id="fileInput"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </Box>

            <Button
              colorScheme="purple"
              isLoading={uploading}
              onClick={handleUpload}
              isDisabled={!file}
              w="full"
            >
              Analyze Video
            </Button>

            {uploading && <Progress size="xs" isIndeterminate w="100%" />}

            {analysis && (
              <VStack spacing={4} w="100%" align="stretch">
                <Text fontWeight="bold" fontSize="lg">Analysis Results:</Text>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text>Content: {analysis.content ? 'Yes' : 'No'}</Text>
                  <Text>Scared: {analysis.scared ? 'Yes' : 'No'}</Text>
                  <Text>Hungry: {analysis.hungry ? 'Yes' : 'No'}</Text>
                </Box>
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default AnalyzerPage
