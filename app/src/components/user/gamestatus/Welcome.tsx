import {
  VStack,
  Input,
  Button,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useTranslation } from "next-i18next";
import { FC, useState } from "react";
import { useSocket } from "../../../providers/SocketProvider";
import { textShadow } from "../../../utils/theme";

export const Welcome: FC = () => {
  const { joinServer, pin, setPin, name, setName } = useSocket();
  const [pinError, setPinError] = useState(false);
  const { t } = useTranslation();

  return (
    <VStack spacing={8} w="100%" px={16}>
      <FormControl isInvalid={pinError}>
        <Input
          variant="player"
          placeholder="PIN"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
          }}
          type="number"
        />

        <FormErrorMessage fontSize="xl" textShadow={textShadow}>
          {t("common:user:invalidpin")}
        </FormErrorMessage>
      </FormControl>

      <Button
        variant="btm"
        onClick={() => {
          joinServer(pin, name).catch((e) => {
            setPinError(true);
          });
        }}
      >
        {t("common:user:enter")}
      </Button>
    </VStack>
  );
};
