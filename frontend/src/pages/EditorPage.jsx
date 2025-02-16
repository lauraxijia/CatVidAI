import { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Image,
  Heading,
  Card,
  CardBody,
  Flex,
  Spinner,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
} from 'react-share';
import axios from 'axios';

const EditorPage = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [generatedResponse, setGeneratedResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shareURL, setShareURL] = useState('');
  const toast = useToast();

  // Handle image selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImageURL(URL.createObjectURL(file));
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a valid image file',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Upload Image and Process on Backend
  const handleUpload = async () => {
    if (!imageFile) {
      toast({
        title: 'No Image Selected',
        description: 'Please upload an image first.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post('http://localhost:8000/process_image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setGeneratedResponse(response.data.generated_text);

      // Generate shareable link
      const shareableText = `AI Response: ${response.data.generated_text}`;
      setShareURL(`https://yourwebsite.com/share?text=${encodeURIComponent(shareableText)}`);

      toast({
        title: 'Success!',
        description: 'Image has been processed.',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process image.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box textAlign="center">
        <Heading size="2xl" mb={3}>AI Image Processor</Heading>
        <Text color="gray.600" fontSize="xl">Upload an image and let AI make it funny & cute</Text>
      </Box>

      <Card variant="outline" maxW="600px" mx="auto">
        <CardBody>
          <VStack spacing={6}>
            {imageURL ? (
              <Box position="relative" w="100%">
                <Image src={imageURL} alt="Uploaded image" borderRadius="md" maxH="400px" mx="auto" />
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
                onClick={() => document.getElementById('imageInput').click()}
              >
                <Icon as={FiUpload} w={12} h={12} color="purple.500" mb={4} />
                <Text fontWeight="medium" fontSize="lg">
                  Click to upload an image
                </Text>
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {imageURL && (
        <>
          <Button colorScheme="purple" isLoading={loading} onClick={handleUpload}>
            Process Image
          </Button>

          {loading && <Spinner size="xl" color="purple.500" />}

          {generatedResponse && (
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold" fontSize="lg">AI Response:</Text>
              <Text>{generatedResponse}</Text>
            </Box>
          )}

          {/* Social Media Sharing */}
          {generatedResponse && (
            <>
              <Text fontWeight="bold" fontSize="lg">Share Your Results:</Text>
              <HStack spacing={4} justify="center">
                <FacebookShareButton url={shareURL} quote={`Check out this AI-generated description: ${generatedResponse}`}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>

                <TwitterShareButton url={shareURL} title={`Check out this AI-generated description: ${generatedResponse}`}>
                  <TwitterIcon size={32} round />
                </TwitterShareButton>

                <WhatsappShareButton url={shareURL} title={`Check out this AI-generated description: ${generatedResponse}`}>
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>

                <LinkedinShareButton url={shareURL} title={`Check out this AI-generated description: ${generatedResponse}`} summary="AI-powered image processing">
                  <LinkedinIcon size={32} round />
                </LinkedinShareButton>
              </HStack>
            </>
          )}
        </>
      )}
    </VStack>
  );
};

export default EditorPage;
