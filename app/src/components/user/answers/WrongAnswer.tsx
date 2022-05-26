import { VStack, Heading } from "@chakra-ui/react";
import _ from "lodash";
import { FC } from "react";
import { useSocket } from "../../../providers/SocketProvider";
import { useGame } from "../../../store/GameStore";
import { usePlayer } from "../../../store/PlayerStore";

export const WrongAnswer: FC = () => {
  const { clientId } = usePlayer();
  const { onlinePlayers, gameData } = useGame((s) => ({
    onlinePlayers: s.onlinePlayers,
    gameData: s.gameData,
  }));
  const { answerData } = useSocket();
  const meFiltered = _.pickBy(onlinePlayers, (item) => item.id === clientId);
  const me = meFiltered[Object.keys(meFiltered)[0]];

  return (
    <VStack textAlign="center" color="white" justifyContent="center" h="100%">
      <Heading fontSize={"7xl"}>OPS</Heading>
      <Heading fontSize={"5xl"}>{me?.name}</Heading>
      <Heading fontWeight="normal" fontSize={"3xl"}>
        Non hai guadagnato alcun punto!
      </Heading>
      <Heading fontWeight="normal" fontSize={"3xl"}>
        Il tuo tempo di risposta è{" "}
        {(answerData.answerTime - gameData.startedTime) / 1000}s
      </Heading>
    </VStack>
  );
};
