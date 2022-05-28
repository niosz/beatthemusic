import { extendTheme, ThemeComponents } from "@chakra-ui/react";

export const colors = {
  success: "#4caf50",
  error: "#f00",
};

const shadows = {
  inside: "inset 0px -4px 20px rgba(255,255,255,.7)",
  button: "inset 0px 0px 50px rgba(255,255,255,0.5)",
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

export const textShadow = "0px 0px 8px #000";

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
  Table: {
    variants: {
      beatTheMusic: {
        table: {
          backdropFilter: "blur(10px)",
          rounded: "3xl",
          overflow: "hidden",
        },
        tr: {
          td: {
            bg: "whiteAlpha.200",
            py: 2,
          },
          th: {
            bg: "whiteAlpha.200",
            borderBottomWidth: 1,
            borderBottomColor: "whiteAlpha.300",
            textTransform: "inherit",
            fontWeight: "normal",
            fontSize: "md",
          },
          _last: {
            td: {
              pb: 6,
            },
          },
        },
      },
    },
  },
  FormErrorMessage: {},
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
