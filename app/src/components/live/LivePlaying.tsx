import { Box, Heading, HStack } from "@chakra-ui/react";
import { FC } from "react";
import { useSocket } from "../../providers/SocketProvider";
import { useGame } from "../../store/GameStore";
import { buttonColors } from "../../utils/const";
import { textShadow } from "../../utils/theme";
import { QuizAnswerBox } from "./QuizAnswerBox";

export const LivePlaying: FC = () => {
  const { quizData } = useGame();
  const { endQuiz } = useSocket();
  return (
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
        <source src={`/assets/video/${quizData.video}`} />
      </video>
      <Box
        display="flex"
        alignItems="center"
        position="absolute"
        w="100vw"
        h="100vh"
      >
        <Heading
          w="100%"
          textAlign="center"
          color="white"
          fontSize="6xl"
          textShadow={textShadow}
        >
          {quizData?.q}
        </Heading>
      </Box>
      <HStack
        spacing={6}
        p={4}
        w="100%"
        color="white"
        position="absolute"
        bottom={0}
      >
        {quizData?.answers?.map((answer, i) => {
          return (
            <QuizAnswerBox
              key={`quizanswer-${i}`}
              color={buttonColors[i]}
              answer={answer}
              char={String.fromCharCode(65 + i)}
            />
          );
        })}
      </HStack>
    </>
  );
};
