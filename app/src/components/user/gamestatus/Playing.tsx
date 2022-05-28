import {
  VStack,
  SimpleGrid,
  Button,
  Heading,
  Box,
  HStack,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";
import { useSocket } from "../../../providers/SocketProvider";
import { useGame } from "../../../store/GameStore";
import { buttonColors, SHOW_RESULTS } from "../../../utils/const";
import { CorrectAnswer } from "../answers/CorrectAnswer";
import { WrongAnswer } from "../answers/WrongAnswer";

export const Playing: FC = () => {
  const { quizData, counter, quizResult, gameData } = useGame((s) => ({
    quizData: s.quizData,
    counter: s.counter,
    quizResult: s.quizResult,
    gameData: s.gameData,
  }));
  const { answerData, answerQuestion } = useSocket();
  const showResults = counter === SHOW_RESULTS;
  const isCorrectAnswer = answerData?.answerIndex === quizResult?.correctAnswer;

  return (
    <>
      <VStack p={2} w="100%" h="100vh" position="relative">
        <HStack w="100%" h={20}>
          <Box
            h="100%"
            flex={1}
            backgroundRepeat="no-repeat"
            backgroundImage="/assets/logo.png"
            backgroundSize="contain"
            backgroundPosition="left"
          />
          <Box flex={1}>
            <Text fontSize="xl" color="white">
              Domanda {gameData.quizNumber + 1} di {gameData.totalQuestions}
            </Text>
          </Box>
        </HStack>
        <SimpleGrid w="100%" flex={1} columns={2} spacing={2}>
          {quizData?.answers?.map((a, i) => {
            const char =
              quizData.keyboard === "TRUEFALSE"
                ? ["V", "F"][i]
                : String.fromCharCode(65 + i);
            return (
              <Button
                key={`ans-${i}`}
                variant="unstyled"
                opacity={
                  answerData.answerIndex === i || answerData.answerIndex === -1
                    ? 1
                    : 0.5
                }
                onClick={() => {
                  if (answerData.answerIndex !== 1) {
                    answerQuestion(i);
                  }
                }}
                shadow="button"
                rounded="xl"
                bgColor={buttonColors[i]}
                overflow="hidden"
                h="100%"
                position="relative"
              >
                <Heading
                  position="absolute"
                  userSelect="none"
                  textAlign="center"
                  color="white"
                  fontSize="500px"
                  h="100%"
                  lineHeight={"70%"}
                  top={0}
                  left={-7}
                >
                  {char}
                </Heading>
              </Button>
            );
          })}
        </SimpleGrid>
        {showResults && (
          <Box
            bg={isCorrectAnswer ? "#4caf50BB" : "#FF0000CD"}
            position="absolute"
            w="100%"
            h="100%"
            top={-2}
            left={0}
          >
            {isCorrectAnswer ? <CorrectAnswer /> : <WrongAnswer />}
          </Box>
        )}
      </VStack>
    </>
  );
};
