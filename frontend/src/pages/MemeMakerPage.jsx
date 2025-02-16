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
} from '@chakra-ui/react'
import { FiUpload, FiDownload } from 'react-icons/fi'
import axios from 'axios'

const MemeMakerPage = () => {
  const [image, setImage] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const toast = useToast()

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

  const generateMeme = async () => {
    if (!image || !prompt) {
      toast({
        title: 'Missing input',
        description: 'Please upload an image and provide a prompt',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/generate-meme', {
        image: image,
        prompt: prompt,
      })
      setGeneratedImage(response.data.generatedImage)
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
        <Heading size="lg" mb={2}>Meme Generator</Heading>
        <Text color="gray.600">Upload an image and create custom memes with Pika</Text>
      </Box>

      <Card variant="outline" maxW="800px" mx="auto">
        <CardBody>
          <VStack spacing={6}>
            {!image ? (
              <Box
                border="2px dashed"
                borderColor="purple.200"
                borderRadius="lg"
                p={10}
                w="100%"
                textAlign="center"
                bg="purple.50"
                cursor="pointer"
                onClick={() => document.getElementById('imageInput').click()}
              >
                <IconButton
                  icon={<FiUpload />}
                  size="lg"
                  colorScheme="purple"
                  variant="ghost"
                  mb={4}
                  aria-label="Upload image"
                />
                <Text>Click to upload an image or drag and drop</Text>
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </Box>
            ) : (
              <Box position="relative" w="100%">
                <Image
                  src={image}
                  alt="Uploaded image"
                  borderRadius="md"
                  maxH="400px"
                  mx="auto"
                />
                <Button
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme="purple"
                  onClick={() => setImage(null)}
                >
                  Change Image
                </Button>
              </Box>
            )}

            <Input
              placeholder="Describe your meme idea (e.g., 'Add a funny cat emoji in the corner')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              size="lg"
            />

            <Button
              colorScheme="purple"
              size="lg"
              isLoading={loading}
              onClick={generateMeme}
              isDisabled={!image || !prompt}
              w="full"
            >
              Generate Meme
            </Button>

            {loading && (
              <Flex direction="column" align="center">
                <Spinner size="xl" color="purple.500" />
                <Text mt={2} color="gray.600">Creating your meme with Pika...</Text>
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
