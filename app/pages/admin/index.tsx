import { Button, Input, VStack, Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { ChangeEvent, ChangeEventHandler, useEffect, useState } from "react";
import io, { Socket } from "Socket.IO-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { useSocket } from "../../src/providers/SocketProvider";
import { useGame } from "../../src/store/GameStore";
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const Admin: NextPage = () => {
  const { onlinePlayers, gameData } = useGame();
  const { startGame, endGame, startQuiz } = useSocket();

  useEffect(() => {
    socketInitializer();
  }, []);

  const socketInitializer = async () => {
    await fetch("/api/socket");
    socket = io();
  };

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
    </VStack>
  );
};

export default Admin;
