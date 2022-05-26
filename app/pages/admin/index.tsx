import { Button, VStack, Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import { useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { useSocket } from "../../src/providers/SocketProvider";
import { useGame } from "../../src/store/GameStore";
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const Admin: NextPage = () => {
  const { onlinePlayers, gameData } = useGame((s) => ({
    onlinePlayers: s.onlinePlayers,
    gameData: s.gameData,
  }));
  const { startGame, endGame, startQuiz, goToNextStep } = useSocket();

  useEffect(() => {
    socketInitializer();
  }, []);

  const socketInitializer = async () => {
    await fetch("/api/socket");
    socket = io();
  };

  const isInResultSteps = gameData.quizStarted && gameData.resultStep > -1;

  return (
    <VStack>
      <Button onClick={gameData?.started ? endGame : startGame}>
        {gameData?.started ? "Close" : "Open"} room
      </Button>
      {gameData?.started && <Button onClick={startQuiz}>Start quiz</Button>}
      {onlinePlayers &&
        Object.keys(onlinePlayers).map((player, i) => {
          return <Text key={`player-${i}`}>{onlinePlayers[player].name}</Text>;
        })}

      {isInResultSteps && (
        <Button onClick={goToNextStep}>Step successivo</Button>
      )}
    </VStack>
  );
};

export default Admin;
