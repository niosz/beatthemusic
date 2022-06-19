import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Heading,
  HStack,
} from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import { useSocket } from "../../providers/SocketProvider";
import { useGame } from "../../store/GameStore";
import { buttonColors } from "../../utils/const";
import { textShadow } from "../../utils/theme";
import { AnimLogo, BeatingLogo } from "../common/BeatingLogo";
import { BlurredImage } from "../common/BlurredImage";
import { QuizAnswerBox } from "./QuizAnswerBox";

export const LivePlaying: FC = () => {
  const { quizData } = useGame((s) => ({ quizData: s.quizData }));
  const { endQuiz } = useSocket();
  const [mountedVideo, setMountedVideo] = useState(false);
  const [remainingTime, setRemainingTime] = useState(-1);
  const [duration, setDuration] = useState(-1);

  /* Force video remount */
  useEffect(() => {
    setMountedVideo(false);
    setTimeout(() => {
      setMountedVideo(true);
    }, 100);
  }, [quizData.video]);
  let progressColor = "yellow.400";
  if (remainingTime < 10) {
    progressColor = "red.600";
  }

  const progress = (remainingTime / duration) * 100;
  console.log(quizData);

  return (
    <>
      {mountedVideo && (
        <video
          onPlay={(e) => {
            setDuration(e.currentTarget.duration);
          }}
          onTimeUpdate={(e) => {
            const currRemainingTime =
              e.currentTarget.duration - e.currentTarget.currentTime;
            setRemainingTime(currRemainingTime);
          }}
          onEnded={() => {
            endQuiz();
          }}
          autoPlay
          // muted
          style={{
            position: "absolute",
            objectFit: "cover",
            width: "100vw",
            height: "100vh",
          }}
        >
          <source src={`/assets/video/${quizData.video}`} />
        </video>
      )}
      {duration > 0 && (
        <BlurredImage
          percentage={progress}
          src={`/assets/video/${quizData.blurImg}`}
        />
      )}
      <Box w={400} h={300} position="absolute" top={-12} left={-6}>
        <AnimLogo />
      </Box>

      {duration > -1 && (
        <Box position="absolute" top={0} right={0} m={6}>
          <CircularProgress
            size="3xs"
            min={duration}
            max={0}
            value={remainingTime}
            color={progressColor}
          >
            <CircularProgressLabel>
              <Heading textShadow={textShadow} fontSize={"7xl"} color="white">
                {Math.round(remainingTime)}
              </Heading>
            </CircularProgressLabel>
          </CircularProgress>
        </Box>
      )}
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
        alignItems="stretch"
      >
        {quizData?.answers?.map((answer, i) => {
          const char =
            quizData.keyboard === "TRUEFALSE"
              ? ["V", "F"][i]
              : String.fromCharCode(65 + i);
          return (
            <QuizAnswerBox
              key={`quizanswer-${i}`}
              color={buttonColors[i]}
              hideAnswer={quizData?.keyboard === "TRUEFALSE"}
              answer={answer}
              char={char}
            />
          );
        })}
      </HStack>
    </>
  );
};
