import { VStack, Text, HStack } from "@chakra-ui/react";
import _ from "lodash";
import { useTranslation } from "next-i18next";
import { useSocket } from "../../../providers/SocketProvider";
import { useGame } from "../../../store/GameStore";
import { QuizAnswerBox } from "../../live/QuizAnswerBox";
import { OnStageAnswer } from "../answers/OnStageAnswer";

export const OnStage = () => {
  const { gameData } = useGame((s) => ({
    gameData: s.gameData,
  }));
  const { answerExtraEvent } = useSocket();
  const { extraEventAnswered } = gameData;
  const { t } = useTranslation();
  return (
    <VStack w="100%" h="100%" borderWidth={1}>
      {!_.isNull(extraEventAnswered) && extraEventAnswered && <OnStageAnswer />}
      {_.isNull(extraEventAnswered) && (
        <>
          <QuizAnswerBox
            onClick={() => {
              answerExtraEvent(true);
            }}
            answer={t("common:user:yes").toUpperCase()}
            char={t("common:user:yes").toUpperCase()}
            color="#4caf50"
            hideAnswer
            bigText
          />
          <QuizAnswerBox
            onClick={() => {
              answerExtraEvent(false);
            }}
            answer={t("common:user:no").toUpperCase()}
            char={t("common:user:no").toUpperCase()}
            color="#f00"
            hideAnswer
            bigText
          />
        </>
      )}
    </VStack>
  );
};
