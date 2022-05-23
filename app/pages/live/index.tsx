import { VStack, Text, Box, Heading, HStack } from "@chakra-ui/react";
import _ from "lodash";
import type { NextPage } from "next";
import { useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { Counter } from "../../src/components/counter";
import { useSocket } from "../../src/providers/SocketProvider";
import { useGame } from "../../src/store/GameStore";
import { GAME_STARTING, SHOW_RESULTS } from "../../src/utils/const";

const Live: NextPage = () => {
  const { onlinePlayers, gameData, counter, quizData, quizResult } = useGame();
  const { initLive, endQuiz } = useSocket();
  const props = useSpring({
    from: { scale: 2 },
    to: { scale: 0 },
    loop: true,
    config: { friction: 40, bounce: 100, damping: 0.8 },
  });

  const connectedPlayers = Object.keys(onlinePlayers).length;
  const connectedPlayersWithName = Object.keys(onlinePlayers).filter((k) => {
    return onlinePlayers[k].name !== "";
  }).length;

  const showQuestion = gameData.quizStarted && counter === 0;
  const showResults = counter === SHOW_RESULTS;
  const totalAnswers = _.sumBy(quizResult.answers, (a) => {
    return a.people;
  });

  useEffect(() => {
    setTimeout(() => {
      initLive();
    }, 500);
  }, [initLive]);

  return (
    <Box w="100vw" h="100vh">
      <video
        autoPlay
        muted
        loop
        style={{
          position: "absolute",
          objectFit: "cover",
          width: "100vw",
          height: "100vh",
        }}
      >
        <source src="/assets/bg.mp4" />
      </video>
      {!showQuestion && !showResults && (
        <>
          {!gameData?.started && (
            <Box
              display="flex"
              w="100%"
              h="100%"
              py={16}
              alignItems="center"
              justifyContent="center"
              position="relative"
              zIndex={2}
            >
              <animated.div
                style={{
                  width: "100%",
                  height: "100%",
                  transformOrigin: "center",
                  transform: props.scale
                    .to([0, 1, 2], [0.75, 1, 0.75])
                    .to((s) => `scale(${s})`),
                }}
              >
                <Box
                  w="100%"
                  h="100%"
                  backgroundRepeat="no-repeat"
                  backgroundImage="/assets/logo.png"
                  backgroundSize="contain"
                  backgroundPosition="center"
                />
              </animated.div>
            </Box>
          )}
          <VStack spacing={0}>
            <Box
              position="absolute"
              top={0}
              left={0}
              w={52}
              h={24}
              backgroundRepeat="no-repeat"
              backgroundImage="/assets/logo.png"
              backgroundSize="contain"
              backgroundPosition="center"
            />
            {gameData?.started && (
              <VStack zIndex={2} h="100vh" justifyContent="space-between">
                <Box
                  p={8}
                  roundedBottom={"3xl"}
                  bgGradient="linear(blackAlpha.300 0%, blackAlpha.700 100%)"
                  color="white"
                  shadow="inside"
                >
                  <Heading size="lg">Gioca su beathemusic.play</Heading>
                </Box>

                {!gameData?.quizStarted && (
                  <Box
                    bgImage={"/assets/elements/pin.png"}
                    bgRepeat="no-repeat"
                    bgSize="contain"
                    bgPos="center"
                    p={14}
                  >
                    <Heading fontSize={"5xl"} color="white" mt={8}>
                      {gameData?.pin?.substring(0, 3)}
                      {` `}
                      {gameData?.pin?.substring(3, 6)}
                    </Heading>
                  </Box>
                )}
                {gameData?.quizStarted && counter === GAME_STARTING && (
                  <Heading color="white">Preparati!</Heading>
                )}
                {gameData?.quizStarted && counter !== GAME_STARTING && (
                  <Counter count={counter} />
                )}

                {connectedPlayers === 0 && (
                  <Heading pb={32} color="white">
                    IN ATTESA DI PARTECIPANTI...
                  </Heading>
                )}

                {connectedPlayers > 0 && (
                  <Box
                    bgGradient="linear(blackAlpha.300 0%, blackAlpha.700 100%)"
                    position="absolute"
                    roundedRight="3xl"
                    p={4}
                    pr={8}
                    left={0}
                    top={"60vh"}
                    shadow="inside"
                  >
                    <Heading color="white">
                      {Object.keys(onlinePlayers).length}
                    </Heading>
                  </Box>
                )}

                <VStack wrap="wrap" pb={16}>
                  {connectedPlayersWithName > 0 && (
                    <>
                      <Text color="white">Giocatori a bordo</Text>

                      {Object.keys(onlinePlayers).map((player, i) => {
                        const onlinePlayer = onlinePlayers[player];
                        if (onlinePlayer.name === "") return null;
                        return (
                          <Box
                            bgGradient="linear(blackAlpha.300 0%, blackAlpha.700 100%)"
                            rounded="xl"
                            p={2}
                            m={1}
                            shadow="inside"
                            key={`player-${i}`}
                          >
                            <Text color="white">{onlinePlayer.name}</Text>
                          </Box>
                        );
                      })}
                    </>
                  )}
                </VStack>
              </VStack>
            )}
          </VStack>
        </>
      )}
      {showQuestion && (
        <>
          <video
            onEnded={() => {
              endQuiz();
            }}
            autoPlay
            muted
            style={{
              position: "absolute",
              objectFit: "contain",
              width: "100vw",
              height: "100vh",
            }}
          >
            <source src={`/assets/${quizData.q}`} />
          </video>
        </>
      )}
      {showResults && (
        <VStack color="white" position="relative">
          <Text>Risultati</Text>
          <HStack>
            {quizResult.answers.map((a, i) => {
              return (
                <VStack key={`a-${i}`}>
                  <Text>
                    Risposta {a.answerCode}: {a.people}
                  </Text>
                  <Box
                    rounded={"md"}
                    overflow="hidden"
                    w={24}
                    h="70vh"
                    bg="#ccc"
                  >
                    <Box
                      bg={quizResult.correctAnswer === i ? "#4caf50" : "#f00"}
                      h={`${(a.people / totalAnswers) * 100}%`}
                    ></Box>
                  </Box>
                </VStack>
              );
            })}
          </HStack>
        </VStack>
      )}
    </Box>
  );
};

export default Live;
