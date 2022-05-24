import { VStack, Box } from "@chakra-ui/react";
import _ from "lodash";
import type { NextPage } from "next";
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
  const { onlinePlayers, gameData, counter } = useGame();
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
      {gameStatus !== "playing" && (
        <Box
          w="100%"
          h={gameData?.started ? "40%" : "100%"}
          backgroundRepeat="no-repeat"
          backgroundImage="/assets/logo.png"
          backgroundSize="contain"
          backgroundPosition="center"
        />
      )}
      {gameStatus === "welcome" && gameData?.started && <Welcome />}
      {gameStatus === "joined" && <Joined />}
      {gameStatus === "counting" && <Counting />}
      {gameStatus === "playing" && <Playing />}
    </VStack>
  );
};

export default Home;
