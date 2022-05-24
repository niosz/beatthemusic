import { VStack, Heading } from "@chakra-ui/react";
import _ from "lodash";
import { FC } from "react";
import { useSocket } from "../../../providers/SocketProvider";
import { useGame } from "../../../store/GameStore";
import { usePlayer } from "../../../store/PlayerStore";

export const CorrectAnswer: FC = () => {
  const { clientId } = usePlayer();
  const { onlinePlayers, gameData } = useGame();
  const { answerData } = useSocket();
  const meFiltered = _.pickBy(onlinePlayers, (item) => item.id === clientId);
  const me = meFiltered[Object.keys(meFiltered)[0]];

  return (
    <VStack color="white" justifyContent="center" h="100%">
      <Heading fontSize={"8xl"}>BRAVO!</Heading>
      <Heading fontSize={"6xl"}>{me?.name}</Heading>
      <Heading fontWeight="normal" fontSize={"4xl"}>
        Hai guadagnato X punto
      </Heading>
      <Heading fontWeight="normal" fontSize={"4xl"}>
        Il tuo tempo di risposta è{" "}
        {(answerData.answerTime - gameData.startedTime) / 1000}s
      </Heading>
    </VStack>
  );
};
