import { VStack, Box } from "@chakra-ui/react";
import _ from "lodash";
import type { NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { BeatingLogo } from "../src/components/common/BeatingLogo";
import { ExtraStage } from "../src/components/live/ExtraStage";
import { Counting } from "../src/components/user/gamestatus/Counting";
import { OnStage } from "../src/components/user/gamestatus/OnStage";
import { Joined } from "../src/components/user/gamestatus/Joined";
import { Playing } from "../src/components/user/gamestatus/Playing";
import { Welcome } from "../src/components/user/gamestatus/Welcome";
import { useGame } from "../src/store/GameStore";
import { usePlayer } from "../src/store/PlayerStore";
import { SHOW_RESULTS } from "../src/utils/const";
import { CustomGetServerSideProps } from "../src/utils/i18";

type Step = "welcome" | "joined" | "counting" | "playing" | "extra-round";

const Home: NextPage = () => {
  const { clientId } = usePlayer();
  const { onlinePlayers, gameData, counter } = useGame((s) => ({
    onlinePlayers: s.onlinePlayers,
    gameData: s.gameData,
    counter: s.counter,
  }));
  const meFiltered = _.pickBy(onlinePlayers, (item) => item.id === clientId);
  const me = meFiltered[Object.keys(meFiltered)[0]];

  const isPlaying = [SHOW_RESULTS, 0].indexOf(counter) > -1;
  let gameStatus: Step = "welcome";
  if (me?.isInRoom) {
    gameStatus = "joined";
    if (gameData?.quizStarted) {
      gameStatus = isPlaying ? "playing" : "counting";
    }
    if (
      gameData.extraEventStarted &&
      (gameData.extraEventAnswered || gameData.extraEventAnswered === null)
    ) {
      gameStatus = "extra-round";
    }
  }

  // showBeatingLogo is true when the game status is not playing or is not "extra-round"
  const showBeatingLogo = !isPlaying && gameStatus !== "extra-round";

  return (
    <VStack bgImage={`/assets/bgblur.jpg`} w="100vw" h="100vh">
      {showBeatingLogo && <BeatingLogo playerLayout />}
      <VStack flex={1} w="100%">
        {gameStatus === "welcome" && gameData?.started && <Welcome />}
        {gameStatus === "joined" && <Joined />}
        {gameStatus === "counting" && <Counting />}
        {gameStatus === "playing" && <Playing />}
        {gameStatus === "extra-round" && (
          <>{gameData.onStageName === me.name ? <OnStage /> : <ExtraStage />}</>
        )}
      </VStack>
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

export default Home;
