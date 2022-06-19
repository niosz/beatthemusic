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
  const mountAfter = 500;
  const maxBlur = 20;
  const [props, api] = useSpring(() => ({
    blur: maxBlur,
    opacity: 0.5,
    scale: 1,
  }));

  useEffect(() => {
    const blurValue = maxBlur - maxBlur * (1 - percentage / 100);
    const opacityValue = 0.5 + (0.9 - 0.5) * (1 - percentage / 100);
    const scaleValue = 1 - (1 - 0.8) * (1 - percentage / 100);

    api.start({ blur: blurValue, opacity: opacityValue, scale: scaleValue });
  }, [api, percentage]);

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, mountAfter);
  }, []);

  return (
    <AnimatedBox
      position="absolute"
      bgImage={`url(${src})`}
      bgSize="contain"
      bgRepeat="no-repeat"
      bgPosition="center"
      w="100%"
      h="100%"
      style={{
        filter: props.blur.to((v) => `blur(${v >= 0 ? v : maxBlur}px)`),
        transform: props.scale.to((v) => `scale(${v})`),
        opacity: props.opacity.to((v) => `${show ? v : 0}`),
      }}
    />
  );
};
