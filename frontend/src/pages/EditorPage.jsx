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

const STICKERS = [
  { id: 1, src: 'https://placekitten.com/50/50', alt: 'Cat sticker 1' },
  { id: 2, src: 'https://placekitten.com/51/51', alt: 'Cat sticker 2' },
  { id: 3, src: 'https://placekitten.com/52/52', alt: 'Cat sticker 3' },
]

const EditorPage = () => {
  const [videoUrl, setVideoUrl] = useState(null)
  const [selectedSticker, setSelectedSticker] = useState(null)
  const [stickers, setStickers] = useState([])
  const videoRef = useRef(null)
  const toast = useToast()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.includes('video')) {
      setVideoUrl(URL.createObjectURL(file))
    }
  }

  const handleStickerClick = (sticker) => {
    setSelectedSticker(sticker)
    setStickers([...stickers, { ...sticker, x: 50, y: 50 }])
  }

  const handleStickerDrag = (index, e) => {
    const newStickers = [...stickers]
    const videoRect = videoRef.current.getBoundingClientRect()
    const x = ((e.clientX - videoRect.left) / videoRect.width) * 100
    const y = ((e.clientY - videoRect.top) / videoRect.height) * 100
    newStickers[index] = { ...newStickers[index], x, y }
    setStickers(newStickers)
  }

  const handleShare = () => {
    // In a real app, we would first save the edited video
    toast({
      title: 'Share',
      description: 'Video ready to share!',
      status: 'success',
      duration: 3000,
    })
  }

  return (
    <VStack spacing={8} align="stretch">
      <Box textAlign="center">
        <Heading size="lg" mb={2}>Video Editor</Heading>
        <Text color="gray.600">Add stickers and share your cat videos</Text>
      </Box>

      <Box position="relative" maxW="800px" mx="auto">
        {videoUrl ? (
          <Box position="relative">
            <video
              ref={videoRef}
              src={videoUrl}
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
            textAlign="center"
            bg="purple.50"
            cursor="pointer"
            onClick={() => document.getElementById('videoInput').click()}
          >
            <Text>Click to upload a video</Text>
            <input
              id="videoInput"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </Box>
        )}
      </Box>

      {videoUrl && (
        <>
          <Box>
            <Text fontWeight="bold" mb={4}>Available Stickers:</Text>
            <Grid templateColumns="repeat(auto-fill, minmax(80px, 1fr))" gap={4}>
              {STICKERS.map((sticker) => (
                <Box
                  key={sticker.id}
                  onClick={() => handleStickerClick(sticker)}
                  cursor="pointer"
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: 'purple.50' }}
                >
                  <Image src={sticker.src} alt={sticker.alt} />
                </Box>
              ))}
            </Grid>
          </Box>

          <HStack spacing={4} justify="center">
            <FacebookShareButton url={window.location.href}>
              <FacebookIcon size={32} round />
            </FacebookShareButton>
            <TwitterShareButton url={window.location.href}>
              <TwitterIcon size={32} round />
            </TwitterShareButton>
            <WhatsappShareButton url={window.location.href}>
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
            <IconButton
              icon={<FaShare />}
              colorScheme="purple"
              onClick={handleShare}
              aria-label="Share video"
            />
          </HStack>
        </>
      )}
    </VStack>
  )
}

export default EditorPage
