import { FC } from "react";
import { GAME_STARTING, NOT_COUNTING } from "../../../utils/const";
import { Counter } from "../../counter";
import { Text } from "@chakra-ui/react";
import { useGame } from "../../../store/GameStore";
import { useTranslation } from "next-i18next";

export const Counting: FC = () => {
  const { counter } = useGame((s) => ({ counter: s.counter }));
  const { t } = useTranslation();
  return (
    <>
      {counter === GAME_STARTING && (
        <Text color="white">{t("common:user:abouttobegin")}</Text>
      )}
      {counter > NOT_COUNTING && <Counter count={counter} />}
    </>
  );
};
