import React from 'react';
import { Box, Container, Heading, Image, Stack, Text } from '@chakra-ui/react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import img1 from '../assets/1.png';
import img2 from '../assets/2.png';
import img3 from '../assets/3.png';
import img4 from '../assets/4.png';
import img5 from '../assets/5.png';

const headingOptions = {
    pos: 'absolute',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    textTransform: 'uppercase',
    p: '4',
    fontSize: '4xl',



}

const Home = () => {
    return (

        <Box>
            <MyCarousel />
            <Container maxW={'container.xl'}
                minH={'100vh'}
                p={'16'}
            >
                <Heading textTransform={'uppercase'}
                    py={'2'}
                    m={'auto'}
                    w={'fit-content'}
                    borderBottom={'2px solid'}
                >
                    Services
                </Heading>
                <Stack h="full" p="4" alignItems={['center', 'flex-start']} direction={['column', 'row']}>
                    <Image src={img5} h={['40', '450']} objectFit="cover" borderRadius={['md', 'lg']} mb={['4', '0']} />
                    <Text
                        letterSpacing="widest"
                        lineHeight="190%"
                        p={['4', '16']}
                        textAlign={['center', 'left']}
                        fontSize={['md', 'lg', 'xl']}
                        color="white.700"
                        fontWeight="medium"
                        
                    >
                        <p>Welcome to the Gesture Management Page! </p>
                        

                        <p>Our page offers comprehensive tools to efficiently manage and view gesture details.</p> 
                        <p>Admins can easily access essential information and perform actions such as searching, pagination, editing, and deleting gestures. </p>
                        <p>Discover the power of efficient gesture data management today!</p>
                    </Text>
                </Stack>
            </Container>

        </Box>
    )
}

const MyCarousel = () => {
    return (
        <Carousel
            autoPlay
            infiniteLoop
            interval={1000}
            showStatus={false}
            showArrows={false}
            showThumbs={false}
        >
            <Box w='full' h={'100vh'}>
                <Image src={img1} />
                <Heading bgColor={'blackAlpha.600'} color={'white'} {...headingOptions} top={'50%'}>
                    No Isolation Anymore
                </Heading>
            </Box>
            <Box w='full' h={'100vh'}>
                <Image src={img2} />
                <Heading bgColor={'whiteAlpha.600'} color={'black'} {...headingOptions} top={['50%', '50%']}>
                    Accessibility At Your Screen
                </Heading>
            </Box>
            <Box w='full' h={'100vh'}>
                <Image src={img3} />
                <Heading bgColor={'whiteAlpha.600'} color={'black'} {...headingOptions} top={['50%', '50%']}>
                    Communicate Freely
                </Heading>
            </Box>
            <Box w='full' h={'100vh'}>
                <Image src={img4} />
                <Heading bgColor={'whiteAlpha.600'} color={'black'} {...headingOptions} top={['50%', '10%']}>
                    Witness Exposure
                </Heading>
            </Box>
        </Carousel>)
}
export default Home
