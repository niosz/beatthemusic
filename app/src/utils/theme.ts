import { extendTheme, ThemeComponents } from "@chakra-ui/react";

const colors = {};

const shadows = {
  inside: "inset 0px -4px 20px rgba(255,255,255,.7)",
};

const fonts = {
  heading: `'Exo 2', sans-serif`,
  body: `'Exo 2', sans-serif`,
};

export const gameFilledBoxProps = {
  shadow: "inside",
  bg: "#4caf50",
  p: 4,
  color: "white",
  rounded: "2xl",
  fontSize: "4xl",
  fontWeight: "bold",
};

const components: ThemeComponents = {
  Input: {
    baseStyle: {
      field: {
        color: "white",
      },
    },
    variants: {
      player: {
        field: {
          shadow: "inside",
          bg: "blackAlpha.800",
          py: 8,
          color: "white",
          rounded: "2xl",
          textAlign: "center",
          fontSize: "4xl",
        },
      },
    },
  },
};

const styles = {
  global: {
    "html, body": {},
  },
};

export const theme = extendTheme({
  shadows,
  fonts,
  styles,
  colors,
  components,
});
