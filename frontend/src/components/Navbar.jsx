import { Box, Flex, Button, Heading } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <Box bg="white" px={4} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="1200px" mx="auto">
        <Heading size="md" color="purple.600">
          CatVidAI
        </Heading>
        
        <Flex gap={4}>
          <Button
            as={RouterLink}
            to="/"
            variant="ghost"
            colorScheme="purple"
          >
            Analyzer
          </Button>
          <Button
            as={RouterLink}
            to="/editor"
            variant="ghost"
            colorScheme="purple"
          >
            Editor
          </Button>
          <Button
            as={RouterLink}
            to="/memes"
            variant="ghost"
            colorScheme="purple"
          >
            Meme Maker
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Navbar
