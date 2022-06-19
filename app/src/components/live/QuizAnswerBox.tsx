import { Box, Heading, Text } from "@chakra-ui/react";
import { FC } from "react";
import { textShadow } from "../../utils/theme";

interface QuizAnswerBoxProps {
  color: string;
  char: string;
  answer: string;
  bigText?: boolean;
  hideAnswer?: boolean;
  onClick?: () => void;
}

export const QuizAnswerBox: FC<QuizAnswerBoxProps> = ({
  color,
  answer,
  char,
  hideAnswer = false,
  onClick,
  bigText,
}) => {
  return (
    <Box
      textAlign="center"
      p={2}
      py={6}
      flex={1}
      bg={color}
      rounded="3xl"
      position="relative"
      shadow="button"
      overflow="hidden"
      width={"100%"}
      onClick={onClick}
    >
      <Heading
        bgGradient="linear(to-b, rgba(255,255,255,1), rgba(255,255,255,0.6), rgba(255,255,255,0.2), rgba(255,255,255,.1))"
        fontWeight="black"
        bgClip="text"
        fontSize={bigText ? "30vw" : "12vw"}
        position="absolute"
        top={0}
        height={"100%"}
        lineHeight={bigText ? "28vw" : "6.7vw"}
      >
        {char}
      </Heading>

      <Box display="flex" h="100%" alignItems="center" justifyContent="center">
        <Text
          as={"div"}
          textShadow={textShadow}
          fontSize="2xl"
          fontWeight="bold"
          lineHeight="8"
          opacity={hideAnswer ? 0 : 1}
        >
          {answer}
        </Text>
      </Box>
    </Box>
  );
};
