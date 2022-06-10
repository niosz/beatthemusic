import { Box, Text } from "@chakra-ui/react";
import _ from "lodash";
import type { NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useRef, useState } from "react";
import { BGLiveVideo } from "../../src/components/live/BGLiveVideo";
import { ExtraStage } from "../../src/components/live/ExtraStage";
import { LivePlaying } from "../../src/components/live/LivePlaying";
import { QuizResultSteps } from "../../src/components/live/QuizReultSteps";
import { WaitingRoom } from "../../src/components/live/WaitingRoom";
import { useSocket } from "../../src/providers/SocketProvider";
import { useGame } from "../../src/store/GameStore";
import { SHOW_RESULTS } from "../../src/utils/const";
import { CustomGetServerSideProps } from "../../src/utils/i18";

const Live: NextPage = () => {
  const { gameData, counter, quizData } = useGame((s) => ({
    gameData: s.gameData,
    counter: s.counter,
    quizData: s.quizData,
  }));
  const { initLive } = useSocket();
  const initialized = useRef(false);

  const showQuestion = gameData.quizStarted && counter === 0;
  const showResults = counter === SHOW_RESULTS;
  const [ip, setIP] = useState("");

  useEffect(() => {
    if (!initialized.current) {
      initLive().then((ip) => {
        setIP(ip);
      });
      initialized.current = true;
    }
  }, [initLive]);

  return (
    <Box w="100vw" h="100vh">
      <BGLiveVideo />
      {!gameData.extraEventStarted && !showQuestion && !showResults && (
        <WaitingRoom ip={ip} />
      )}
      {showQuestion && quizData?.video && <LivePlaying />}
      {gameData.extraEventStarted && <ExtraStage />}
      {showResults && !gameData.extraEventStarted && <QuizResultSteps />}
    </Box>
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

export default Live;
