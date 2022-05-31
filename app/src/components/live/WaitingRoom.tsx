import { Box, Heading, VStack, Text, AspectRatio } from "@chakra-ui/react";
import { useGame } from "../../store/GameStore";
import { FC } from "react";
import { GAME_STARTING } from "../../utils/const";
import { Counter } from "../counter";
import { BeatingLogo } from "../common/BeatingLogo";
import { useQRCode } from "next-qrcode";
import { textShadow } from "../../utils/theme";
import { useTranslation } from "next-i18next";

interface WaitingRoomProps {
  ip: string;
}

export const WaitingRoom: FC<WaitingRoomProps> = ({ ip }) => {
  const { gameData, counter, onlinePlayers } = useGame((s) => ({
    gameData: s.gameData,
    counter: s.counter,
    onlinePlayers: s.onlinePlayers,
  }));
  const { Canvas } = useQRCode();
  const { t } = useTranslation();

  const connectedPlayers = Object.keys(onlinePlayers).length;
  const connectedPlayersWithName = Object.keys(onlinePlayers).filter((k) => {
    return onlinePlayers[k].name !== "";
  }).length;

  return (
    <>
      {!gameData?.started && !gameData?.quizStarted && (
        <VStack h="100%">
          <Box h={28} w="100%" />
          <VStack w="100%" position="relative">
            <Box w={200} h={200} rounded="md" overflow={"hidden"}>
              <Canvas
                text={`http://${ip}:3000/`}
                options={{
                  type: "image/jpeg",
                  quality: 0.3,
                  level: "M",
                  margin: 3,
                  scale: 4,
                  width: 200,
                  color: {
                    dark: "#000",
                    light: "#FFF",
                  },
                }}
              />
            </Box>
          </VStack>
          <BeatingLogo />
        </VStack>
      )}
      <VStack spacing={0}>
        <Box
          position="absolute"
          top={0}
          left={0}
          w={52}
          h={24}
          backgroundRepeat="no-repeat"
          backgroundImage="/assets/logo.png"
          backgroundSize="contain"
          backgroundPosition="center"
        />
        {gameData?.started && (
          <VStack zIndex={2} h="100vh" justifyContent="space-between">
            <Box
              p={8}
              roundedBottom={"3xl"}
              bgGradient="linear(blackAlpha.300 0%, blackAlpha.700 100%)"
              color="white"
              shadow="inside"
            >
              <VStack w="100%" position="relative">
                <Box w={140} h={140} rounded="md" overflow={"hidden"}>
                  <Canvas
                    text={`http://${ip}:3000/`}
                    options={{
                      type: "image/jpeg",
                      quality: 0.3,
                      level: "M",
                      margin: 3,
                      scale: 4,
                      width: 140,
                      color: {
                        dark: "#000",
                        light: "#FFF",
                      },
                    }}
                  />
                </Box>
              </VStack>
            </Box>

            {!gameData?.quizStarted && (
              <Box
                bgImage={"/assets/elements/pin.png"}
                bgRepeat="no-repeat"
                bgSize="contain"
                bgPos="center"
                p={14}
              >
                <Heading fontSize={"5xl"} color="white" mt={8}>
                  {gameData?.pin?.substring(0, 3)}
                  {` `}
                  {gameData?.pin?.substring(3, 6)}
                </Heading>
              </Box>
            )}
            {gameData?.quizStarted && counter === GAME_STARTING && (
              <Heading color="white">{t("common:live:getready")}</Heading>
            )}
            {gameData?.quizStarted && counter !== GAME_STARTING && (
              <Counter count={counter} size={80} />
            )}

            {connectedPlayers === 0 && (
              <Heading pb={32} color="white" textShadow={textShadow}>
                {t("common:live:waiting")}
              </Heading>
            )}

            {connectedPlayers > 0 && (
              <Box
                bgGradient="linear(blackAlpha.300 0%, blackAlpha.700 100%)"
                position="absolute"
                roundedRight="3xl"
                p={4}
                pr={8}
                left={0}
                top={"60vh"}
                shadow="inside"
              >
                <Heading color="white">
                  {Object.keys(onlinePlayers).length}
                </Heading>
              </Box>
            )}

            <VStack wrap="wrap" pb={16}>
              {connectedPlayersWithName > 0 && (
                <>
                  <Text color="white">{t("common:live:onlineplayers")}</Text>

                  {Object.keys(onlinePlayers).map((player, i) => {
                    const onlinePlayer = onlinePlayers[player];
                    if (onlinePlayer.name === "") return null;
                    return (
                      <Box
                        bgGradient="linear(blackAlpha.300 0%, blackAlpha.700 100%)"
                        rounded="xl"
                        p={2}
                        m={1}
                        shadow="inside"
                        key={`player-${i}`}
                      >
                        <Text color="white">{onlinePlayer.name}</Text>
                      </Box>
                    );
                  })}
                </>
              )}
            </VStack>
          </VStack>
        )}
      </VStack>
    </>
  );
};
