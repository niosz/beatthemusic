import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { QuizResult } from "../../server_src/interfaces";
import { AnswerData, QuizData, useGame } from "../store/GameStore";
import { usePlayer } from "../store/PlayerStore";
let socketConnection: Socket<DefaultEventsMap, DefaultEventsMap>;

interface ISocketContext {
  joinServer: (pin: string, name: string) => void;
  startGame: () => void;
  endGame: () => void;
  initLive: () => void;
  startQuiz: () => void;
  answerQuestion: (index: number) => void;
  endQuiz: () => void;
  answerData: AnswerData;
  pin: string;
  setPin: (pin: string) => void;
  name: string;
  setName: (name: string) => void;
}

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketContext = createContext<ISocketContext>({
  joinServer: () => {},
  startGame: () => {},
  endGame: () => {},
  initLive: () => {},
  startQuiz: () => {},
  answerQuestion: () => {},
  endQuiz: () => {},
  answerData: {
    answerIndex: -1,
    answerTime: 0,
    answerScore: 0,
    answerElapsed: 0,
  },
  pin: "",
  setPin: () => {},
  name: "",
  setName: () => {},
});

interface EventQueue {
  eventName: string;
  obj: any;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { setClientId } = usePlayer();
  const [emitQueue, setEmitQueue] = useState<EventQueue[]>([]);
  const [answerData, setAnswerData] = useState<AnswerData>({
    answerIndex: -1,
    answerTime: 0,
    answerScore: 0,
    answerElapsed: 0,
  });
  const {
    setOnlinePlayers,
    setGameData,
    setCounter,
    setQuizData,
    // setAnswerData,
    setQuizResult,
  } = useGame();
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");

  const socketInitializer = useCallback(async () => {
    await fetch("/api/socket");
    socketConnection = io();

    socketConnection.on("connect", () => {
      setClientId(socketConnection.id);
    });

    socketConnection.on("online-players", (msg) => {
      setOnlinePlayers(msg);
    });

    socketConnection.on("answer-data", (aData: AnswerData) => {
      setAnswerData(aData);
    });

    socketConnection.on("game-data", (msg) => {
      setGameData(msg);
    });

    socketConnection.on("quiz-counter", (counter) => {
      setCounter(counter);
    });

    socketConnection.on("quiz-data", (quiz: QuizData) => {
      setQuizData(quiz);
    });

    socketConnection.on("quiz-result", (qr: QuizResult) => {
      setQuizResult(qr);
    });
  }, [
    setAnswerData,
    setClientId,
    setCounter,
    setGameData,
    setOnlinePlayers,
    setQuizData,
    setQuizResult,
  ]);

  const emitEvent = (event: string, args?: any) => {
    if (socketConnection) {
      socketConnection.emit(event, args);
    } else {
      const emitterInterval = setInterval(() => {
        console.log("try", event);
        if (socketConnection) {
          socketConnection.emit(event, args);
          clearInterval(emitterInterval);
        }
      }, 100);
    }
  };

  useEffect(() => {
    socketInitializer();
  }, [socketInitializer]);

  const joinServer = (pin: string, name: string) => {
    emitEvent("join-game", { pin, name });
  };

  const startGame = () => {
    emitEvent("start-game");
  };

  const initLive = () => {
    emitEvent("game-data");
  };

  const endGame = () => {
    emitEvent("end-game");
  };

  const startQuiz = () => {
    emitEvent("start-quiz");
  };

  const answerQuestion = (i: number) => {
    emitEvent("answer-question", i);
  };

  const endQuiz = () => {
    emitEvent("end-quiz");
  };

  const value: ISocketContext = {
    joinServer,
    startGame,
    endGame,
    initLive,
    startQuiz,
    answerQuestion,
    endQuiz,
    answerData,
    pin,
    setPin,
    name,
    setName,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
