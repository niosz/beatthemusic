import { VStack, Heading } from "@chakra-ui/react";
import _ from "lodash";
import { useTranslation } from "next-i18next";
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
  const { t } = useTranslation();

  return (
    <VStack textAlign="center" color="white" justifyContent="center" h="100%">
      <Heading fontSize={"7xl"}>{t("common:user:correctanswer:title")}</Heading>
      <Heading fontSize={"5xl"}>{me?.name}</Heading>
      <Heading fontWeight="normal" fontSize={"3xl"}>
        {t(
          `common:user:correctanswer:${
            answerData.answerScore === 1 ? "earnedscore1" : "earnedscoremore"
          }`,
          { score: answerData.answerScore }
        )}
      </Heading>
      <Heading fontWeight="normal" fontSize={"3xl"}>
        {t("common:user:avgtime", { time: answerData.answerElapsed / 1000 })}
      </Heading>
    </VStack>
  );
};
