import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { SocketProvider } from "../src/providers/SocketProvider";
import { theme } from "../src/utils/theme";
import "@fontsource/exo-2";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </ChakraProvider>
  );
}

export default MyApp;
