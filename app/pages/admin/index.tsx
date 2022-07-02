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
  useMediaQuery,
  Stack,
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
import { CustomGetServerSideProps } from "../../src/utils/i18";
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const Admin: NextPage = () => {
  const [isLargerThan720] = useMediaQuery("(min-width: 720px)");

  const { onlinePlayers, gameData, quizData, quizResult, counter } = useGame(
    (s) => ({
      onlinePlayers: s.onlinePlayers,
      gameData: s.gameData,
      quizData: s.quizData,
      quizResult: s.quizResult,
      counter: s.counter,
    })
  );
  const [quizIndex, setQuizIndex] = useState(-1);
  const {
    startGame,
    endGame,
    startQuiz,
    endQuiz,
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

  const isBetweenQuiz =
    gameData?.started && (!gameData?.quizStarted || gameData?.resultStep === 2);

  return (
    <VStack
      bgImage={`/assets/bgblur.jpg`}
      bgRepeat="no-repeat"
      bgSize="cover"
      borderWidth={1}
      borderColor="black"
      spacing={4}
      p={8}
      h="100vh"
    >
      <Stack
        direction={isLargerThan720 ? "row" : "column"}
        color="white"
        spacing={6}
        borderWidth={1}
        borderColor="whiteAlpha.300"
        rounded="md"
        p={4}
        bg="whiteAlpha.300"
        backdropFilter="blur(10px)"
        w={isLargerThan720 ? "auto" : "100%"}
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
            disabled={!gameData?.started && quizIndex === -1}
            onClick={() => {
              gameData?.started ? endGame() : startGame(quizIndex);
            }}
          >
            {gameData?.started ? "Close" : "Open"} room
          </Button>
          {isBetweenQuiz && (
            <Button size="sm" variant="solidAdmin" onClick={startQuiz}>
              Start quiz
            </Button>
          )}
          {gameData.allAnswered && !isInResultSteps && (
            <VStack>
              <Text>All players have answered.</Text>
              <Button size="sm" variant="solidAdmin" onClick={endQuiz}>
                End quiz now
              </Button>
            </VStack>
          )}
          {gameData?.quizNumber > -1 && isBetweenQuiz && (
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
            <Stack direction={isLargerThan720 ? "row" : "column"}>
              <Text>
                Question {gameData.quizNumber + 1}/{gameData.totalQuestions}:
              </Text>
              <Text fontWeight="bold">
                {gameData?.quizStarted && quizData?.q}
              </Text>
            </Stack>
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
        <Text>{}</Text>
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
      </Stack>
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
            <VStack spacing={2}>
              <Heading fontSize="2xl">Players</Heading>
              <Table variant="beatTheMusic">
                <Tbody>
                  {Object.keys(onlinePlayers)
                    .sort((a, b) => {
                      return onlinePlayers[b].score - onlinePlayers[a].score;
                    })
                    .map((p) => (
                      <Tr key={p}>
                        <Td>{onlinePlayers[p].name}</Td>
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
