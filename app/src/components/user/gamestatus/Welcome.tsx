import { VStack, Input, Button } from "@chakra-ui/react";
import { FC } from "react";
import { useSocket } from "../../../providers/SocketProvider";

export const Welcome: FC = () => {
  const { joinServer, pin, setPin, name, setName } = useSocket();

  return (
    <VStack spacing={8} w="100%" px={16}>
      <Input
        variant="player"
        placeholder="PIN"
        value={pin}
        onChange={(e) => {
          setPin(e.target.value);
        }}
        type="number"
      />

      <Button
        onClick={() => {
          joinServer(pin, name);
        }}
      >
        Enter
      </Button>
    </VStack>
  );
};
