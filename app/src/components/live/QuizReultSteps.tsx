import { VStack, HStack, Box, Text } from "@chakra-ui/react";
import _ from "lodash";
import { FC } from "react";
import { useGame } from "../../store/GameStore";
import { buttonColors } from "../../utils/const";
import { textShadow } from "../../utils/theme";
import { QuizAnswerBox } from "./QuizAnswerBox";

export const QuizResultSteps: FC = () => {
  const { quizResult, quizData, gameData } = useGame();
  const totalAnswers = _.sumBy(quizResult.answers, (a) => {
    return a.people;
  });

  return (
    <VStack
      bgImage={`/assets/bgresults.png`}
      h="100vh"
      color="white"
      position="relative"
    >
      <HStack w="100%" h={20} px={4}>
        <Box
          h="100%"
          flex={1}
          backgroundRepeat="no-repeat"
          backgroundImage="/assets/logo.png"
          backgroundSize="contain"
          backgroundPosition="left"
        />
        <Box flex={1}>
          <Text
            fontSize="xl"
            textAlign="center"
            color="white"
            fontWeight="bold"
          >
            {quizData?.q}
          </Text>
        </Box>
        <Box textAlign="right" flex={1}>
          <Text fontSize="xl" color="white">
            Domanda {gameData.quizNumber + 1} di {gameData.totalQuestions}
          </Text>
        </Box>
      </HStack>
      <HStack w="100%" h="100%" px={4}>
        {quizResult.answers.map((a, i) => {
          const isCorrect = quizResult?.correctAnswer === i;
          return (
            <VStack
              justifyContent="center"
              roundedTop={"3xl"}
              bgGradient={
                isCorrect
                  ? "linear(to-b, rgba(255,255,255,0), rgba(255,255,255,0.05), rgba(255,255,255,0.2))"
                  : undefined
              }
              height="100%"
              flex={1}
              key={`qa-box-${i}`}
            >
              <Box
                position="relative"
                w="100%"
                p={2}
                textAlign="center"
                mt={-16}
              >
                <QuizAnswerBox
                  color={buttonColors[i]}
                  answer={quizData.answers[i]}
                  char={String.fromCharCode(65 + i)}
                />
                <Text
                  position="absolute"
                  w="100%"
                  fontWeight={isCorrect ? "bold" : "normal"}
                  textShadow={textShadow}
                  fontSize={isCorrect ? "5xl" : "3xl"}
                  mt={isCorrect ? 8 : 12}
                >
                  {a.people}
                </Text>
              </Box>
            </VStack>
          );
        })}
      </HStack>
    </VStack>
  );
};
