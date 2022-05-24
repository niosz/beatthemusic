import { VStack, SimpleGrid, Button, Heading, Box } from "@chakra-ui/react";
import { FC } from "react";
import { useSocket } from "../../../providers/SocketProvider";
import { useGame } from "../../../store/GameStore";
import { SHOW_RESULTS } from "../../../utils/const";
import { CorrectAnswer } from "../answers/CorrectAnswer";
import { WrongAnswer } from "../answers/WrongAnswer";

export const Playing: FC = () => {
  const { quizData, counter, quizResult } = useGame();
  const { answerData, answerQuestion } = useSocket();
  const showResults = counter === SHOW_RESULTS;
  const isCorrectAnswer = answerData?.answerIndex === quizResult?.correctAnswer;
  const c = ["#4caf50", "#f00", "#feaccc", "#0f0"];

  return (
    <>
      <VStack w="100%" h="100vh" position="relative">
        <SimpleGrid w="100%" flex={1} columns={2} spacing={2}>
          {quizData?.answers?.map((a, i) => {
            return (
              <Button
                key={`ans-${i}`}
                // disabled={answerData.answerIndex !== -1}
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
                shadow="inside"
                rounded="xl"
                bgColor={c[i]}
                overflow="hidden"
                h="100%"
              >
                <Heading
                  userSelect="none"
                  textAlign="center"
                  color="white"
                  fontSize="280"
                  h="100%"
                  lineHeight={"90%"}
                >
                  {String.fromCharCode(65 + i)}
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
