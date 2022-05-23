import {
  VStack,
  Text,
  Button,
  Input,
  Box,
  SimpleGrid,
  Heading,
} from "@chakra-ui/react";
import _ from "lodash";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { Counter } from "../src/components/counter";
import { useSocket } from "../src/providers/SocketProvider";
import { useGame } from "../src/store/GameStore";
import { usePlayer } from "../src/store/PlayerStore";
import { GAME_STARTING, NOT_COUNTING } from "../src/utils/const";
import { gameFilledBoxProps } from "../src/utils/theme";

type Step = "welcome" | "joined" | "counting" | "playing";

const Home: NextPage = () => {
  const { clientId } = usePlayer();
  const { onlinePlayers, quizData, gameData, counter, answer } = useGame();
  const meFiltered = _.pickBy(onlinePlayers, (item) => item.id === clientId);
  const me = meFiltered[Object.keys(meFiltered)[0]];

  const { joinServer, answerQuestion } = useSocket();
  const [name, setName] = useState(me?.name || "");
  const [pin, setPin] = useState("");

  let gameStatus: Step = "welcome";
  if (me?.isInRoom) {
    gameStatus = "joined";
    if (gameData?.quizStarted) {
      gameStatus = counter === 0 ? "playing" : "counting";
    }
  }

  const c = ["#4caf50", "#f00", "#feaccc", "#0f0"];
  useEffect(() => {
    console.log(answer);
  }, [answer]);

  return (
    <VStack bgImage={`/assets/bgblur.jpg`} w="100vw" h="100vh">
      {/* <Text color="white">
        {clientId} - {gameStatus}
      </Text> */}

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
      {gameStatus === "welcome" && gameData?.started && (
        <VStack spacing={8} w="100%" px={16}>
          <Input
            variant="player"
            placeholder="PIN"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
            }}
            type="number"
          />

          <Button
            onClick={() => {
              joinServer(pin, name);
            }}
          >
            Enter
          </Button>
        </VStack>
      )}
      {gameStatus === "joined" && me.name === "" && (
        <VStack spacing={8} w="100%" px={16}>
          <Input
            variant="player"
            placeholder="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />

          <Button
            onClick={() => {
              joinServer(pin, name);
              setPin("");
            }}
          >
            Enter
          </Button>
        </VStack>
      )}
      {gameStatus === "joined" && me.name !== "" && (
        <VStack spacing={12}>
          <VStack spacing={0}>
            <Text color="white">Resta in attesa, </Text>
            <Heading color="white">{me.name}</Heading>
          </VStack>
          <Box {...gameFilledBoxProps}>Iniziamo a breve!</Box>
        </VStack>
      )}
      {gameStatus === "counting" && (
        <>
          {counter === GAME_STARTING && (
            <Text color="white">Il gioco sta per cominciare...</Text>
          )}
          {counter > NOT_COUNTING && <Counter count={counter} />}
        </>
      )}
      {gameStatus === "playing" && (
        <>
          <VStack w="100%" h="100vh">
            {/* <Box>
              <Text color="white">{quizData?.q}</Text>
            </Box> */}
            <SimpleGrid w="100%" flex={1} columns={2} spacing={2}>
              {quizData?.answers?.map((a, i) => {
                return (
                  <Button
                    key={`ans-${i}`}
                    disabled={answer.answerIndex !== -1}
                    variant="unstyled"
                    opacity={
                      answer.answerIndex === i || answer.answerIndex === -1
                        ? 1
                        : 0.5
                    }
                    onClick={() => {
                      answerQuestion(i);
                    }}
                    shadow="inside"
                    rounded="xl"
                    bgColor={c[i]}
                    overflow="hidden"
                    h="100%"
                  >
                    <Heading
                      userSelect="none"
                      textAlign="center"
                      color="white"
                      fontSize="280"
                      h="100%"
                      lineHeight={"90%"}
                    >
                      {String.fromCharCode(65 + i)}
                    </Heading>
                  </Button>
                );
              })}
            </SimpleGrid>
          </VStack>
        </>
      )}
    </VStack>
  );
};

export default Home;
