import { useGame } from "../../store/GameStore";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { textShadow } from "../../utils/theme";

export const ExtraStage = () => {
  const { gameData } = useGame((s) => ({ gameData: s.gameData }));
  const [scramble, setScramble] = useState("");
  const scrambleIndex = useRef(0);

  const { extraEventStarted, extraEventType, onStageName, extraEventAnswered } =
    gameData;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (extraEventStarted && extraEventType === "ON_STAGE") {
      interval = setInterval(() => {
        // generate words made of random letters
        const word = _.range(0, 12)
          .map(() => {
            return String.fromCharCode(65 + Math.floor(Math.random() * 26));
          })
          .join("")
          .toLowerCase();
        setScramble(word.charAt(0).toUpperCase() + word.slice(1));
      }, 100);
      if (!_.isNull(onStageName)) {
        clearTimeout(interval);
        setScramble(onStageName);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [extraEventStarted, extraEventType, gameData, onStageName]);

  return (
    <>
      {extraEventType === "ON_STAGE" && (
        <VStack
          textAlign="center"
          h="100%"
          zIndex={10}
          color="white"
          position="relative"
          justifyContent="center"
          spacing={8}
        >
          <Heading textShadow={textShadow} fontSize="6xl">
            BONUS ROUND
          </Heading>
          {_.isNull(extraEventAnswered) && (
            <>
              <Heading textShadow={textShadow}>
                Salirà sul palco con noi:
              </Heading>
              <Heading fontSize="xl" textShadow={textShadow}>
                Estrazione casuale
              </Heading>
              <Heading
                backdropFilter={`blur(10px)`}
                py={4}
                px={16}
                rounded="full"
                shadow="inside"
                textShadow={textShadow}
              >
                {scramble}
              </Heading>
              <Heading fontSize="xl" textShadow={textShadow}>
                {
                  'Rispondi "Sì" o "No" sul tuo smartphone per partecipare all\'estrazione casuale!'
                }
              </Heading>
            </>
          )}
          {!_.isNull(extraEventAnswered) && (
            <>
              {extraEventAnswered && (
                <Heading textShadow={textShadow}>
                  Salirà sul palco con noi:
                </Heading>
              )}
              <Heading
                backdropFilter={`blur(10px)`}
                py={4}
                px={16}
                rounded="full"
                shadow="inside"
                textShadow={textShadow}
                color={extraEventAnswered ? "success" : "error"}
              >
                {scramble}
              </Heading>
              {extraEventAnswered ? (
                <Heading size="2xl" textShadow={textShadow} color="success">
                  HA ACCETTATO
                </Heading>
              ) : (
                <Heading size="2xl" textShadow={textShadow} color="error">
                  HA RIFIUTATO
                </Heading>
              )}
            </>
          )}
        </VStack>
      )}
    </>
  );
};
