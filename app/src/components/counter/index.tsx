import { Circle, Heading } from "@chakra-ui/react";
import { useSpring, animated } from "react-spring";
import { FC, useEffect, useState } from "react";

interface CounterProps {
  count: number;
  size?: number;
}

export const Counter: FC<CounterProps> = ({ count, size = 48 }) => {
  const [props, api] = useSpring(() => ({
    scale: 0,
  }));

  useEffect(() => {
    api.set({ scale: 0 });
    api.start({ scale: 2 });
  }, [api, count]);

  return (
    <animated.div
      style={{
        transform: props.scale
          .to([0, 1, 2], [0.75, 1, 0.75])
          .to((s) => `scale(${s})`),
      }}
    >
      <Circle size={size} bg="whiteAlpha.600">
        <Heading color="white" fontSize={size > 50 ? "120px" : "8xl"}>
          {count}
        </Heading>
      </Circle>
    </animated.div>
  );
};
