import { Box, HStack, Text } from "@chakra-ui/react";
import { FC, useEffect, useRef, useState } from "react";
import { animated, useSpring } from "react-spring";
import { textShadow } from "../../utils/theme";
import useWindowDimensions from "../../utils/useWindowDimensions";

interface LyricsProps {
  text: string;
  progressPercentage: number;
}

const AnimatedBox = animated(Box);

const wrapTags = (text: string, regex: RegExp) => {
  const textArray = text.split("\n");
  return textArray.map((text, textIndex) => {
    return (
      <HStack key={"line-" + textIndex}>
        {text.split(" ").map((str, index) => {
          if (regex.test(str)) {
            // remove ** from str
            const strWithoutMarker = str.replace(/\*\*/g, "");
            return (
              <Text key={"t-" + index} color="#f00">
                {strWithoutMarker}
              </Text>
            );
          }
          return (
            <Text key={"t-" + index} color="white">
              {str}
            </Text>
          );
        })}
      </HStack>
    );
  });
};

export const Lyrics: FC<LyricsProps> = ({ text, progressPercentage }) => {
  const { width } = useWindowDimensions();
  const boxRef = useRef<HTMLDivElement>(null);
  const realBoxRef = useRef<HTMLDivElement>(null);
  const [props, api] = useSpring(() => ({
    bottom: 100,
  }));

  const getBoxWidth = () => {
    if (boxRef.current) {
      return boxRef.current.getBoundingClientRect().width;
    }
    return 0;
  };

  const getRealBoxHeight = () => {
    if (realBoxRef.current) {
      return realBoxRef.current.getBoundingClientRect().height;
    }
    return 0;
  };
  const [lyricsWidth, setLyricsWidth] = useState(getBoxWidth());
  const [lyricsHeight, setLyricsHeight] = useState(getRealBoxHeight());

  useEffect(() => {
    function handleResize() {
      setLyricsWidth(getBoxWidth());
      setLyricsHeight(getRealBoxHeight());
    }

    window.addEventListener("resize", handleResize);

    setTimeout(() => {
      setLyricsWidth(getBoxWidth());
      setLyricsHeight(getRealBoxHeight());
    }, 0);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    api.start({ bottom: progressPercentage });
  }, [api, progressPercentage]);

  // percentage between width and lyricsWidth, reduced by 10%
  const percentage = (width / lyricsWidth) * 80;

  return (
    <Box position="absolute" overflow="hidden" w="100%" h="100%">
      {
        /** This is the dummy text to calc */
        <Box ref={boxRef} opacity={0} h="100%" position="absolute">
          <Text textAlign="center" color="white">
            {text?.split("\n").map((line, index) => (
              <Text key={index}>{line}</Text>
            ))}
          </Text>
        </Box>
      }

      <AnimatedBox
        ref={realBoxRef}
        w="100%"
        alignItems={"center"}
        h="100%"
        position="absolute"
        textAlign="center"
        style={{
          bottom: props.bottom
            .to([0, 50, 100], [lyricsHeight, 0, -lyricsHeight])
            .to((s) => `${s}px`),
        }}
      >
        <Text
          textShadow={textShadow}
          fontSize={`${percentage}%`}
          textAlign="center"
          color="white"
        >
          {text?.split("\n").map((line, index) => {
            // check if line contains **{text}**
            const regex = /\*\*(.{0,})\*\*/g;
            return <Text key={index}>{wrapTags(line, regex)}</Text>;
          })}
        </Text>
      </AnimatedBox>
    </Box>
  );
};
