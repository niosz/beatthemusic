import { Box, Heading, Text } from "@chakra-ui/react";
import { FC } from "react";
import { textShadow } from "../../utils/theme";

interface QuizAnswerBoxProps {
  color: string;
  char: string;
  answer: string;
}

export const QuizAnswerBox: FC<QuizAnswerBoxProps> = ({
  color,
  answer,
  char,
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
    >
      <Heading
        bgGradient="linear(to-b, rgba(255,255,255,1), rgba(255,255,255,0.6), rgba(255,255,255,0.2), rgba(255,255,255,.1))"
        fontWeight="black"
        bgClip="text"
        fontSize="12vw"
        position="absolute"
        top={0}
        height={"100%"}
        lineHeight="6.7vw"
      >
        {char}
      </Heading>
      <Text
        textShadow={textShadow}
        fontSize="2xl"
        fontWeight="bold"
        lineHeight="8"
      >
        {answer}
      </Text>
    </Box>
  );
};
