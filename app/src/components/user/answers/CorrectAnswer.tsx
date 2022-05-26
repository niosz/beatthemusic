import { VStack, Heading } from "@chakra-ui/react";
import _ from "lodash";
import { FC } from "react";
import { useSocket } from "../../../providers/SocketProvider";
import { useGame } from "../../../store/GameStore";
import { usePlayer } from "../../../store/PlayerStore";

export const CorrectAnswer: FC = () => {
  const { clientId } = usePlayer();
  const { onlinePlayers } = useGame((s) => ({
    onlinePlayers: s.onlinePlayers,
  }));
  const { answerData } = useSocket();
  const meFiltered = _.pickBy(onlinePlayers, (item) => item.id === clientId);
  const me = meFiltered[Object.keys(meFiltered)[0]];

  return (
    <VStack textAlign="center" color="white" justifyContent="center" h="100%">
      <Heading fontSize={"7xl"}>BRAVO!</Heading>
      <Heading fontSize={"5xl"}>{me?.name}</Heading>
      <Heading fontWeight="normal" fontSize={"3xl"}>
        Hai guadagnato {answerData.answerScore} punti
      </Heading>
      <Heading fontWeight="normal" fontSize={"3xl"}>
        Il tuo tempo di risposta è {answerData.answerElapsed / 1000}s
      </Heading>
    </VStack>
  );
};
