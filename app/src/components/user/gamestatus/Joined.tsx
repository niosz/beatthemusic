import {
  VStack,
  Heading,
  Box,
  Text,
  Button,
  Input,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import _ from "lodash";
import { useTranslation } from "next-i18next";
import { FC, useState } from "react";
import { useSocket } from "../../../providers/SocketProvider";
import { useGame } from "../../../store/GameStore";
import { usePlayer } from "../../../store/PlayerStore";
import { gameFilledBoxProps, textShadow } from "../../../utils/theme";

export const Joined: FC = () => {
  const { clientId } = usePlayer();
  const { onlinePlayers } = useGame((s) => ({
    onlinePlayers: s.onlinePlayers,
  }));
  const { joinServer, pin, setPin, name, setName } = useSocket();
  const [badName, setBadName] = useState(false);
  const meFiltered = _.pickBy(onlinePlayers, (item) => item.id === clientId);
  const me = meFiltered[Object.keys(meFiltered)[0]];
  const { t } = useTranslation();

  if (me.name === "") {
    return (
      <VStack spacing={8} w="100%" px={16}>
        <FormControl isInvalid={badName}>
          <Input
            variant="player"
            placeholder="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />

          <FormErrorMessage fontSize="xl" textShadow={textShadow}>
            {t("common:user:invalidname")}
          </FormErrorMessage>
        </FormControl>

        <Button
          onClick={() => {
            joinServer(pin, name)
              .then(() => {
                setPin("");
              })
              .catch((e) => {
                setBadName(true);
              });
          }}
        >
          {t("common:user:enter")}
        </Button>
      </VStack>
    );
  }
  return (
    <VStack spacing={12}>
      <VStack spacing={0}>
        <Text color="white">{t("common:user:pleasewait")}, </Text>
        <Heading color="white">{me.name}</Heading>
      </VStack>
      <Box {...gameFilledBoxProps}>{t("common:user:abouttoplay")}</Box>
    </VStack>
  );
};
