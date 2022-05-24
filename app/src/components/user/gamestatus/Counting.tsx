import { FC } from "react";
import { GAME_STARTING, NOT_COUNTING } from "../../../utils/const";
import { Counter } from "../../counter";
import { Text } from "@chakra-ui/react";
import { useGame } from "../../../store/GameStore";

export const Counting: FC = () => {
  const { counter } = useGame();
  return (
    <>
      {counter === GAME_STARTING && (
        <Text color="white">Il gioco sta per cominciare...</Text>
      )}
      {counter > NOT_COUNTING && <Counter count={counter} />}
    </>
  );
};
