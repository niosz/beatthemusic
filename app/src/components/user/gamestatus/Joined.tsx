import { VStack, Heading, Box, Text, Button, Input } from "@chakra-ui/react";
import _ from "lodash";
import { FC, useState } from "react";
import { useSocket } from "../../../providers/SocketProvider";
import { useGame } from "../../../store/GameStore";
import { usePlayer } from "../../../store/PlayerStore";
import { gameFilledBoxProps } from "../../../utils/theme";

export const Joined: FC = () => {
  const { clientId } = usePlayer();
  const { onlinePlayers } = useGame((s) => ({
    onlinePlayers: s.onlinePlayers,
  }));
  const { joinServer, pin, setPin, name, setName } = useSocket();
  const meFiltered = _.pickBy(onlinePlayers, (item) => item.id === clientId);
  const me = meFiltered[Object.keys(meFiltered)[0]];

  if (me.name === "") {
    return (
      <VStack spacing={8} w="100%" px={16}>
        <Input
          variant="player"
          placeholder="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />

        <Button
          onClick={() => {
            joinServer(pin, name);
            setPin("");
          }}
        >
          Enter
        </Button>
      </VStack>
    );
  }
  return (
    <VStack spacing={12}>
      <VStack spacing={0}>
        <Text color="white">Resta in attesa, </Text>
        <Heading color="white">{me.name}</Heading>
      </VStack>
      <Box {...gameFilledBoxProps}>Iniziamo a breve!</Box>
    </VStack>
  );
};
