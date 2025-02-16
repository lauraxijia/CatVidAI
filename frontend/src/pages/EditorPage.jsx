import { useState, useRef } from 'react'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  Image,
  Heading,
  Grid,
  IconButton,
  Card,
  CardBody,
  Icon,
  Spinner,
} from '@chakra-ui/react'
import { FaShare } from 'react-icons/fa'
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from 'react-share'
import { FiUpload } from 'react-icons/fi'
import axios from 'axios'

const STICKERS = [
  { id: 1, src: 'https://placekitten.com/50/50', alt: 'Cat sticker 1' },
  { id: 2, src: 'https://placekitten.com/51/51', alt: 'Cat sticker 2' },
  { id: 3, src: 'https://placekitten.com/52/52', alt: 'Cat sticker 3' },
]

const EditorPage = () => {
  const [videoFile, setVideoFile] = useState(null)
  const [videoURL, setVideoURL] = useState(null)
  const [processedVideoURL, setProcessedVideoURL] = useState(null)
  const [loading, setLoading] = useState(false)
  const [stickers, setStickers] = useState([])
  const videoRef = useRef(null)
  const toast = useToast()

  // Handle video selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.includes('video')) {
      setVideoFile(file)
      setVideoURL(URL.createObjectURL(file))
    }
  }

  // Handle Sticker Click
  const handleStickerClick = (sticker) => {
    setStickers([...stickers, { ...sticker, x: 50, y: 50 }])
  }

  // Handle Sticker Drag
  const handleStickerDrag = (index, e) => {
    const newStickers = [...stickers]
    const videoRect = videoRef.current.getBoundingClientRect()
    const x = ((e.clientX - videoRect.left) / videoRect.width) * 100
    const y = ((e.clientY - videoRect.top) / videoRect.height) * 100
    newStickers[index] = { ...newStickers[index], x, y }
    setStickers(newStickers)
  }

  // Upload Video and Process on Backend
  const handleUpload = async () => {
    if (!videoFile) {
      toast({
        title: 'No Video Selected',
        description: 'Please upload a video first.',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('video', videoFile)

    try {
      const response = await axios.post('http://localhost:8000/process_video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setProcessedVideoURL(response.data.processed_video_url)
      toast({
        title: 'Success!',
        description: 'Video has been processed.',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process video.',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <VStack spacing={8} align="stretch">
      <Box textAlign="center">
        <Heading size="2xl" mb={3}>Video Editor</Heading>
        <Text color="gray.600" fontSize="xl">Upload and process your cat videos</Text>
      </Box>

      <Card variant="outline" maxW="600px" mx="auto">
        <CardBody>
          <VStack spacing={6}>
            {videoURL ? (
              <Box position="relative">
                <video
                  ref={videoRef}
                  src={videoURL}
                  controls
                  style={{ width: '100%', borderRadius: '8px' }}
                />
                {stickers.map((sticker, index) => (
                  <Image
                    key={index}
                    src={sticker.src}
                    alt={sticker.alt}
                    position="absolute"
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'move',
                    }}
                    draggable
                    onDrag={(e) => handleStickerDrag(index, e)}
                    width="50px"
                    height="50px"
                  />
                ))}
              </Box>
            ) : (
              <Box
                border="2px dashed"
                borderColor="purple.200"
                borderRadius="lg"
                p={10}
                w="100%"
                textAlign="center"
                bg="purple.50"
                cursor="pointer"
                onClick={() => document.getElementById('videoInput').click()}
              >
                <Icon as={FiUpload} w={12} h={12} color="purple.500" mb={4} />
                <Text fontWeight="medium" fontSize="lg">
                  Click to upload a video
                </Text>
                <input
                  id="videoInput"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {videoURL && (
        <>
          <Button colorScheme="purple" isLoading={loading} onClick={handleUpload}>
            Process Video
          </Button>

          {loading && <Spinner size="xl" color="purple.500" />}

          {processedVideoURL && (
            <Box textAlign="center">
              <Text fontWeight="bold" fontSize="lg">Processed Video:</Text>
              <video src={processedVideoURL} controls style={{ width: '100%', borderRadius: '8px' }} />
            </Box>
          )}
        </>
      )}
    </VStack>
  )
}

export default EditorPage
