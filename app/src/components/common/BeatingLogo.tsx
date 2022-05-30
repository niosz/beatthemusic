import { Box } from "@chakra-ui/react";
import { FC, memo, useCallback } from "react";
import { useSpring, animated } from "react-spring";

interface BeatingLogoProps {
  playerLayout?: boolean;
}

const RawBeatingLogo: FC<BeatingLogoProps> = ({ playerLayout = false }) => {
  const [props, api] = useSpring(() => ({
    from: { scale: 2 },
    to: { scale: 0 },
    config: { friction: 40 },
    delay: 150,
    reset: true,
    onRest: () => {
      api.set({ scale: 2 });
      api.start({ scale: 0 });
    },
  }));

  return (
    <Box
      display="flex"
      w="100%"
      flex={playerLayout ? 0.8 : 1}
      py={playerLayout ? 8 : 16}
      alignItems="center"
      justifyContent="center"
      position="relative"
      zIndex={2}
      bottom={playerLayout ? 0 : 24}
    >
      <animated.div
        style={{
          width: "100%",
          height: "100%",
          transformOrigin: "center",
          transform: props.scale
            .to([0, 1, 2], [0.75, 1, 0.75])
            .to((s) => `scale(${s})`),
        }}
      >
        <Box
          w="100%"
          h="100%"
          backgroundRepeat="no-repeat"
          backgroundImage="/assets/logo.png"
          backgroundSize="contain"
          backgroundPosition="center"
        />
      </animated.div>
    </Box>
  );
};

export const BeatingLogo = memo(RawBeatingLogo);
