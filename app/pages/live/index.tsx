import { Box } from "@chakra-ui/react";
import _ from "lodash";
import type { NextPage } from "next";
import { useEffect } from "react";
import { BGLiveVideo } from "../../src/components/live/BGLiveVideo";
import { LivePlaying } from "../../src/components/live/LivePlaying";
import { QuizResultSteps } from "../../src/components/live/QuizReultSteps";
import { WaitingRoom } from "../../src/components/live/WaitingRoom";
import { useSocket } from "../../src/providers/SocketProvider";
import { useGame } from "../../src/store/GameStore";
import { SHOW_RESULTS } from "../../src/utils/const";

const Live: NextPage = () => {
  const { gameData, counter, quizData } = useGame();
  const { initLive } = useSocket();

  const showQuestion = gameData.quizStarted && counter === 0;
  const showResults = counter === SHOW_RESULTS;

  useEffect(() => {
    initLive();
  }, [initLive]);

  return (
    <Box w="100vw" h="100vh">
      <BGLiveVideo />
      {!showQuestion && !showResults && <WaitingRoom />}
      {showQuestion && quizData?.video && <LivePlaying />}
      {showResults && <QuizResultSteps />}
    </Box>
  );
};

export default Live;
