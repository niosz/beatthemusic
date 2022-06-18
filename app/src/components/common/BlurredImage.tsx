import { Box } from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";

interface BlurredImageProps {
  src: string;
  percentage: number;
}

const AnimatedBox = animated(Box);

export const BlurredImage: FC<BlurredImageProps> = ({ percentage, src }) => {
  const [show, setShow] = useState(false);
  const mountAfter = 300;
  const maxBlur = 20;
  const [props, api] = useSpring(() => ({
    blur: maxBlur,
  }));

  useEffect(() => {
    const blurValue = maxBlur - maxBlur * (1 - percentage / 100);
    api.start({ blur: blurValue });
  }, [api, percentage]);

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, mountAfter);
  }, []);

  return (
    <AnimatedBox
      opacity={show ? 1 : 0}
      position="absolute"
      bgImage={`url(${src})`}
      w="100%"
      h="100%"
      style={{
        filter: props.blur.to((v) => `blur(${v >= 0 ? v : maxBlur}px)`),
      }}
    />
  );
};
