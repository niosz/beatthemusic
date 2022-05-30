import { VStack, Box } from "@chakra-ui/react";
import _ from "lodash";
import type { NextPage } from "next";
import { BeatingLogo } from "../src/components/common/BeatingLogo";
import { Counting } from "../src/components/user/gamestatus/Counting";
import { Joined } from "../src/components/user/gamestatus/Joined";
import { Playing } from "../src/components/user/gamestatus/Playing";
import { Welcome } from "../src/components/user/gamestatus/Welcome";
import { useGame } from "../src/store/GameStore";
import { usePlayer } from "../src/store/PlayerStore";
import { SHOW_RESULTS } from "../src/utils/const";

type Step = "welcome" | "joined" | "counting" | "playing";

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
  }

  return (
    <VStack bgImage={`/assets/bgblur.jpg`} w="100vw" h="100vh">
      {gameStatus !== "playing" && <BeatingLogo playerLayout />}
      <Box flex={1}>
        {gameStatus === "welcome" && gameData?.started && <Welcome />}
        {gameStatus === "joined" && <Joined />}
        {gameStatus === "counting" && <Counting />}
        {gameStatus === "playing" && <Playing />}
      </Box>
    </VStack>
  );
};

export default Home;
