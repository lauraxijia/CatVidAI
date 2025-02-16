import { useState } from 'react'
import {
  Box,
  VStack,
  Button,
  Text,
  Image,
  useToast,
  Heading,
  Card,
  CardBody,
  Input,
  Flex,
  IconButton,
  Spinner,
  Icon,
} from '@chakra-ui/react'
import { FiUpload, FiDownload } from 'react-icons/fi'
import axios from 'axios'

const MemeMakerPage = () => {
  const [image, setImage] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const toast = useToast()

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        status: 'error',
        duration: 3000,
      })
    }
  }

  // Call FastAPI to generate meme
  const generateMeme = async () => {
    if (!prompt) {
      toast({
        title: 'Missing input',
        description: 'Please enter a meme prompt',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8000/generate_image', {
        prompt: prompt,
        width: 1024,
        height: 1024,
        num_inference_steps: 50,
        negative_prompt: "",
        seed: 42,
      })

      setGeneratedImage(response.data.image_url)
      toast({
        title: 'Success!',
        description: 'Your meme has been generated',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate meme',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Download generated meme
  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = 'generated-meme.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <VStack spacing={8} align="stretch">
      <Box textAlign="center">
        <Heading size="2xl" mb={3}>AI Meme Generator using Stability AI by Nebius</Heading>
        <Text color="gray.600" fontSize="xl">Generate hilarious AI-powered memes</Text>
      </Box>

      <Card variant="outline" maxW="600px" mx="auto">
        <CardBody>
          <VStack spacing={6}>
            <Input
              placeholder="Enter your meme prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              size="lg"
              fontSize="lg"
            />

            <Button
              colorScheme="purple"
              size="lg"
              isLoading={loading}
              onClick={generateMeme}
              isDisabled={!prompt}
              w="full"
            >
              Generate Meme
            </Button>

            {loading && (
              <Flex direction="column" align="center">
                <Spinner size="xl" color="purple.500" />
                <Text mt={2} color="gray.600">Generating your meme...</Text>
              </Flex>
            )}

            {generatedImage && (
              <Box position="relative" w="100%">
                <Image
                  src={generatedImage}
                  alt="Generated meme"
                  borderRadius="md"
                  maxH="400px"
                  mx="auto"
                />
                <IconButton
                  icon={<FiDownload />}
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme="purple"
                  onClick={downloadImage}
                  aria-label="Download meme"
                />
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default MemeMakerPage
