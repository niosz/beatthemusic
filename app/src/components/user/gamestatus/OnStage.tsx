import { VStack, Text, HStack } from "@chakra-ui/react";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useSocket } from "../../../providers/SocketProvider";
import { useGame } from "../../../store/GameStore";
import { QuizAnswerBox } from "../../live/QuizAnswerBox";
import { CorrectAnswer } from "../answers/CorrectAnswer";
import { OnStageAnswer } from "../answers/OnStageAnswer";

export const OnStage = () => {
  const { gameData } = useGame((s) => ({
    gameData: s.gameData,
  }));
  const { answerExtraEvent } = useSocket();
  const { extraEventAnswered } = gameData;
  return (
    <VStack w="100%" h="100%" borderWidth={1}>
      {!_.isNull(extraEventAnswered) && extraEventAnswered && <OnStageAnswer />}
      {_.isNull(extraEventAnswered) && (
        <>
          <QuizAnswerBox
            onClick={() => {
              answerExtraEvent(true);
            }}
            answer="Yes"
            char="Yes"
            color="#4caf50"
          />
          <QuizAnswerBox
            onClick={() => {
              answerExtraEvent(false);
            }}
            answer="No"
            char="No"
            color="#f00"
          />
        </>
      )}
    </VStack>
  );
};
