import { useState, useRef } from 'react';
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
} from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';
import axios from 'axios';

const AnalyzerPage = () => {
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null); // Store file URL for playback
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const toast = useToast();
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Handle file selection (video or audio)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type.includes('video') || selectedFile.type.includes('audio'))) {
      setFile(selectedFile);
      setFileURL(URL.createObjectURL(selectedFile)); // Generate preview URL
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please select a valid video or audio file',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Handle file upload to backend
  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    try {
      const response = await axios.post('http://localhost:8000/analyze-cat-sound', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: false, // Fix CORS issue
      });

      setAnalysis(response.data);
      toast({
        title: 'Success!',
        description: 'Audio analyzed successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to analyze audio',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box textAlign="center">
        <Heading size="2xl" mb={3}>Cat Sound Analyzer</Heading>
        <Text color="gray.600" fontSize="xl">Upload a video or audio file to analyze your cat's mood</Text>
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
                accept="video/*,audio/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </Box>

            {/* Video Preview */}
            {fileURL && file?.type.includes('video') && (
              <video ref={videoRef} controls width="100%">
                <source src={fileURL} type={file.type} />
                Your browser does not support the video tag.
              </video>
            )}

            {/* Audio Preview */}
            {fileURL && file?.type.includes('audio') && (
              <audio ref={audioRef} controls>
                <source src={fileURL} type={file.type} />
                Your browser does not support the audio element.
              </audio>
            )}

            {/* Upload Button */}
            <Button
              colorScheme="purple"
              isLoading={uploading}
              onClick={handleUpload}
              isDisabled={!file}
              w="full"
            >
              Analyze Audio
            </Button>

            {/* Upload Progress */}
            {uploading && <Progress size="xs" isIndeterminate w="100%" />}

            {/* Display Analysis Results */}
            {analysis && (
              <VStack spacing={4} w="100%" align="stretch">
                <Text fontWeight="bold" fontSize="lg">Analysis Results:</Text>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text>Cat Intent: {analysis.cat_intent}</Text>
                </Box>
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default AnalyzerPage;
