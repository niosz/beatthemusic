import { VStack, Heading } from "@chakra-ui/react";
import _ from "lodash";
import { useTranslation } from "next-i18next";
import { FC } from "react";
import { useGame } from "../../../store/GameStore";
import { usePlayer } from "../../../store/PlayerStore";

export const OnStageAnswer: FC = () => {
  const { clientId } = usePlayer();
  const { onlinePlayers } = useGame((s) => ({
    onlinePlayers: s.onlinePlayers,
  }));
  const meFiltered = _.pickBy(onlinePlayers, (item) => item.id === clientId);
  const me = meFiltered[Object.keys(meFiltered)[0]];
  const { t } = useTranslation();

  return (
    <VStack
      w="100%"
      bg={"#4caf50BB"}
      textAlign="center"
      color="white"
      justifyContent="center"
      h="100%"
    >
      <Heading fontSize={"7xl"}>{t("common:user:onstageanswer:title")}</Heading>
      <Heading fontSize={"5xl"}>{me?.name}</Heading>
      <Heading fontWeight="normal" fontSize={"3xl"}>
        {t("common:user:onstageanswer:onstage")}
      </Heading>
    </VStack>
  );
};
