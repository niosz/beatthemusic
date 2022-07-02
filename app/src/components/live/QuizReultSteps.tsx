import {
  VStack,
  HStack,
  Box,
  Text,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Heading,
} from "@chakra-ui/react";
import _ from "lodash";
import { useTranslation } from "next-i18next";
import { FC, useEffect } from "react";
import { animated, useTrail } from "react-spring";
import { useGame } from "../../store/GameStore";
import { buttonColors } from "../../utils/const";
import { textShadow } from "../../utils/theme";
import { QuizAnswerBox } from "./QuizAnswerBox";

const QuizResultStep1: FC = () => {
  const { quizResult, quizData } = useGame((s) => ({
    quizResult: s.quizResult,
    quizData: s.quizData,
  }));
  const { t } = useTranslation();

  const isTrueFalse = _.isBoolean(quizResult.correctAnswer);
  const char = isTrueFalse
    ? (quizResult.correctAnswer as boolean)
      ? "V"
      : "F"
    : String.fromCharCode(65 + (quizResult.correctAnswer as number));
  const correctAnswerData = isTrueFalse
    ? (quizResult.correctAnswer as boolean).toString()
    : quizData.answers[quizResult.correctAnswer as number];

  return (
    <VStack>
      <Text>{t("common:ranking:correctanswer")}</Text>
      <QuizAnswerBox
        answer={correctAnswerData}
        color={buttonColors[quizResult.correctAnswer as number]}
        char={char}
        hideAnswer={quizData?.keyboard === "TRUEFALSE"}
      />
    </VStack>
  );
};

const QuizResultStep2: FC = () => {
  const { quizResult, quizData } = useGame((s) => ({
    quizResult: s.quizResult,
    quizData: s.quizData,
  }));

  return (
    <HStack w="100%" h="100%" px={4}>
      {quizResult.answers.map((a, i) => {
        const isCorrect = quizResult?.correctAnswer === i;
        const char =
          quizData.keyboard === "TRUEFALSE"
            ? ["V", "F"][i]
            : String.fromCharCode(65 + i);
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
            <Box position="relative" w="100%" p={2} textAlign="center" mt={-16}>
              <QuizAnswerBox
                color={buttonColors[i]}
                answer={quizData.answers[i]}
                hideAnswer={quizData?.keyboard === "TRUEFALSE"}
                char={char}
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
  );
};

const QuizResultStep3: FC<{ forceRanking?: boolean }> = ({
  forceRanking = false,
}) => {
  const { rankingData, gameData } = useGame((s) => ({
    rankingData: s.rankingData,
    gameData: s.gameData,
  }));

  const [springs, api] = useTrail(3, () => ({ height: "0%" }));
  const { t } = useTranslation();

  useEffect(() => {
    api.start(() => ({ height: "100%" }));
  }, [api]);
  const gameEnded = gameData.quizEnded;

  if (gameEnded && !forceRanking) {
    return (
      <HStack spacing={8} px={8} w="100%" h="100%" alignItems="flex-end">
        {[2, 1, 3].map((pos) => {
          const h = `${100 - 20 * pos}%`;
          const rankedPlayer = rankingData[pos - 1];
          let color;
          switch (pos) {
            case 1:
              color = "#FFC40088";
              break;
            case 2:
              color = "#BEBEBE77";
              break;
            case 3:
              color = "#611B0077";
              break;
          }
          return (
            <animated.div
              key={`pos-${pos}`}
              style={{
                ...springs[pos - 1],

                flex: 1,
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <VStack flex={1} h={h}>
                <Text>{t("common:ranking:position", { pos })}</Text>
                <VStack
                  py={4}
                  flex={1}
                  w="100%"
                  backdropFilter="blur(10px)"
                  shadow="inside"
                  bgColor={color}
                  roundedTop="3xl"
                >
                  {!_.isUndefined(rankedPlayer) && (
                    <>
                      <Heading fontSize={"5xl"} textShadow={textShadow}>
                        {rankedPlayer.name}
                      </Heading>
                      <Text fontWeight="bold" textShadow={textShadow} flex={1}>
                        {t("common:ranking:userscore", {
                          score: rankedPlayer.score,
                        })}
                      </Text>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        textShadow={textShadow}
                      >
                        {t("common:ranking:avgtime")}:{" "}
                        {(rankedPlayer.timeAvg / 1000).toFixed(3)}s
                      </Text>
                    </>
                  )}
                </VStack>
              </VStack>
            </animated.div>
          );
        })}
      </HStack>
    );
  }

  return (
    <VStack>
      <Heading color="white" mb={4} fontSize="5xl" textShadow={textShadow}>
        {forceRanking ? "Final Ranking" : `Round ${gameData.quizNumber + 1}`}
      </Heading>
      <Table variant="beatTheMusic">
        <Thead>
          <Tr>
            <Th></Th>
            <Th></Th>
            <Th>{t("common:ranking:score")}</Th>
            <Th>{t("common:ranking:roundtime")}</Th>
            <Th>{t("common:ranking:avgtime")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rankingData?.map((rankingItem, i) => {
            return (
              <Tr key={`rank-row-${i}`}>
                <Td>{i + 1}</Td>
                <Td fontWeight="bold">{rankingItem.name}</Td>
                <Td textAlign="right">{rankingItem.score}</Td>
                <Td textAlign="right">
                  {(rankingItem.roundTime / 1000).toFixed(3)}s
                </Td>
                <Td textAlign="right">
                  {(rankingItem.timeAvg / 1000).toFixed(3)}s
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </VStack>
  );
};

export const QuizResultSteps: FC = () => {
  const { quizData, gameData } = useGame((s) => ({
    quizData: s.quizData,
    gameData: s.gameData,
  }));

  const { t } = useTranslation();

  return (
    <VStack
      bgImage={gameData?.resultStep < 2 ? `/assets/bgresults.png` : undefined}
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
            fontSize="3xl"
            textAlign="center"
            color="white"
            fontWeight="bold"
            textShadow={textShadow}
          >
            {quizData?.q}
          </Text>
        </Box>
        <Box textAlign="right" flex={1}>
          <Text fontSize="xl" color="white">
            {t("common:user:question", {
              current: gameData.quizNumber + 1,
              total: gameData.totalQuestions,
            })}
          </Text>
        </Box>
      </HStack>

      {gameData?.resultStep === 0 && <QuizResultStep1 />}
      {gameData?.resultStep === 1 && <QuizResultStep2 />}
      {gameData?.resultStep === 2 && <QuizResultStep3 />}
      {gameData?.resultStep === 3 && <QuizResultStep3 forceRanking />}
    </VStack>
  );
};
