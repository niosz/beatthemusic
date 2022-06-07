import {
  Button,
  VStack,
  Text,
  HStack,
  Heading,
  Box,
  Divider,
  Table,
  Tr,
  Tbody,
  Td,
  Select,
} from "@chakra-ui/react";
import _ from "lodash";
import type { NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Counter } from "../../src/components/counter";
import { useSocket } from "../../src/providers/SocketProvider";
import { useGame } from "../../src/store/GameStore";
import { GAME_STARTING, NOT_COUNTING } from "../../src/utils/const";
import { CustomGetServerSideProps } from "../../src/utils/i18";
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const Admin: NextPage = () => {
  const { onlinePlayers, gameData, quizData, quizResult, counter } = useGame(
    (s) => ({
      onlinePlayers: s.onlinePlayers,
      gameData: s.gameData,
      quizData: s.quizData,
      quizResult: s.quizResult,
      counter: s.counter,
    })
  );
  const [quizIndex, setQuizIndex] = useState(0);
  const {
    startGame,
    endGame,
    startQuiz,
    goToNextStep,
    startExtraEvent,
    initLive,
  } = useSocket();
  const initialized = useRef(false);

  useEffect(() => {
    socketInitializer();
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initLive();
      initialized.current = true;
    }
  }, [initLive]);

  const socketInitializer = async () => {
    await fetch("/api/socket");
    socket = io();
  };

  const isInResultSteps = gameData.quizStarted && gameData.resultStep > -1;

  const getStepInfo = (stepNumber: number) => {
    switch (stepNumber) {
      case 0:
        return "Corrected Answer";
      case 1:
        return "Answers Summary";
      case 2:
        return "Ranking";
      case 3:
        if (gameData.quizNumber + 1 < gameData.totalQuestions) {
          return "New quiz";
        }
        return "Final Summary";
    }
  };

  console.log(gameData);

  return (
    <VStack
      bgImage={`/assets/bgblur.jpg`}
      borderWidth={1}
      borderColor="black"
      spacing={4}
      p={8}
      h="100vh"
    >
      <HStack
        color="white"
        spacing={6}
        borderWidth={1}
        borderColor="whiteAlpha.300"
        rounded="md"
        p={4}
        bg="whiteAlpha.300"
        backdropFilter="blur(10px)"
      >
        <VStack alignItems="stretch">
          <Select
            placeholder="Select quiz"
            value={quizIndex}
            onChange={(e) => {
              setQuizIndex(Number(e.target.value));
            }}
          >
            {gameData?.quizList?.map((quiz, index) => (
              <option key={index} value={index}>
                {quiz.name}
              </option>
            ))}
          </Select>
          <Button
            size="sm"
            variant="solidAdmin"
            disabled={!gameData?.started && quizIndex === 0}
            onClick={() => {
              gameData?.started ? endGame() : startGame(quizIndex);
            }}
          >
            {gameData?.started ? "Close" : "Open"} room
          </Button>
          {gameData?.started && (
            <Button size="sm" variant="solidAdmin" onClick={startQuiz}>
              Start quiz
            </Button>
          )}
          {gameData?.quizNumber > 0 &&
            gameData?.started &&
            (!gameData?.quizStarted || gameData?.resultStep === 2) && (
              <Button
                size="sm"
                variant="solidAdmin"
                onClick={() => {
                  startExtraEvent("ON_STAGE");
                }}
              >
                On Stage
              </Button>
            )}
        </VStack>
        <Divider orientation="vertical" />
        <VStack h="100%" alignItems="flex-start" spacing={0}>
          {gameData?.quizStarted && (
            <HStack>
              <Text>
                Question {gameData.quizNumber + 1}/{gameData.totalQuestions}:
              </Text>
              <Text fontWeight="bold">
                {gameData?.quizStarted && quizData?.q}
              </Text>
            </HStack>
          )}
          <HStack>
            <Text>Online players:</Text>
            <Text fontWeight="bold">{Object.keys(onlinePlayers).length}</Text>
          </HStack>
          <HStack>
            <Text>Answers:</Text>
            <Text fontWeight="bold">
              {_.sumBy(quizResult?.answers, (a) => a.people)}
            </Text>
          </HStack>
        </VStack>
        <VStack h="100%" justifyContent="flex-end">
          {isInResultSteps && (
            <>
              <Text fontSize="sm">
                On screen: {getStepInfo(gameData.resultStep)}
              </Text>
              <Button size="sm" variant="solidAdmin" onClick={goToNextStep}>
                Next: {getStepInfo(gameData.resultStep + 1)}
              </Button>
            </>
          )}
        </VStack>
      </HStack>
      <Box>
        {gameData?.quizStarted && counter > 0 && <Counter count={counter} />}
      </Box>
      <VStack>
        {gameData?.started && (
          <Box
            alignSelf="center"
            bgImage={"/assets/elements/pin.png"}
            bgRepeat="no-repeat"
            bgSize="contain"
            bgPos="center"
            p={14}
            mt={-12}
            mb={-12}
          >
            <Heading fontSize={"5xl"} color="white" mt={8}>
              {gameData?.pin?.substring(0, 3)}
              {` `}
              {gameData?.pin?.substring(3, 6)}
            </Heading>
          </Box>
        )}
      </VStack>
      {gameData?.started &&
        Object.keys(onlinePlayers).filter((p) => onlinePlayers[p].name !== "")
          .length > 0 && (
          <HStack color="white" spacing={6} rounded="md" p={4}>
            {/* online players list */}
            <VStack spacing={2}>
              <Heading fontSize="2xl">Players</Heading>
              {/* table of online players list with score */}
              <Table variant="beatTheMusic">
                <Tbody>
                  {Object.keys(onlinePlayers)
                    .sort((a, b) => {
                      return onlinePlayers[b].score - onlinePlayers[a].score;
                    })
                    .map((p) => (
                      <Tr key={p}>
                        <Td>{onlinePlayers[p].name}</Td>
                        {/* <Td>{onlinePlayers[p].score}</Td> */}
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </VStack>
          </HStack>
        )}
    </VStack>
  );
};

export const getServerSideProps: CustomGetServerSideProps = async ({
  locale,
  req,
  res,
}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default Admin;
