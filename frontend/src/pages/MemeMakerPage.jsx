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
  Spinner,
  IconButton,
  HStack,
} from '@chakra-ui/react'
import { FiDownload } from 'react-icons/fi'
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
} from 'react-share'
import axios from 'axios'

const MemeMakerPage = () => {
  const [generatedImage, setGeneratedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [shareURL, setShareURL] = useState('')
  const toast = useToast()

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
      setShareURL(response.data.image_url) // Set shareable image URL

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
            {/* Meme Text Input */}
            <Input
              placeholder="Enter your meme prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              size="lg"
              fontSize="lg"
            />

            {/* Generate Meme Button */}
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

            {/* Loading Spinner */}
            {loading && (
              <Flex direction="column" align="center">
                <Spinner size="xl" color="purple.500" />
                <Text mt={2} color="gray.600">Generating your meme...</Text>
              </Flex>
            )}

            {/* Display Generated Meme */}
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

            {/* Social Media Sharing */}
            {generatedImage && (
              <>
                <Text fontWeight="bold" fontSize="lg">Share Your Meme:</Text>
                <HStack spacing={4} justify="center">
                  <FacebookShareButton url={shareURL} quote={`Check out my AI-generated meme!`}>
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>

                  <TwitterShareButton url={shareURL} title={`Check out my cat's AI-generated meme!`}>
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>

                  <WhatsappShareButton url={shareURL} title={`Check out my cat's AI-generated meme!`}>
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>

                  <LinkedinShareButton url={shareURL} title={`Check out my cat's AI-generated meme!`} summary="AI-powered meme generation">
                    <LinkedinIcon size={32} round />
                  </LinkedinShareButton>
                </HStack>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default MemeMakerPage
