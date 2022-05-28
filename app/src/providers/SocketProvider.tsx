import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { QuizResult, RankingItem } from "../../server_src/interfaces";
import { AnswerData, QuizData, useGame } from "../store/GameStore";
import { usePlayer } from "../store/PlayerStore";
let socketConnection: Socket<DefaultEventsMap, DefaultEventsMap>;

interface ISocketContext {
  joinServer: (pin: string, name: string) => Promise<boolean>;
  startGame: () => void;
  endGame: () => void;
  initLive: () => void;
  startQuiz: () => void;
  goToNextStep: () => void;
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
  joinServer: () => {
    return Promise.resolve(true);
  },
  startGame: () => {},
  endGame: () => {},
  initLive: () => {},
  startQuiz: () => {},
  goToNextStep: () => {},
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

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { setClientId } = usePlayer();
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
    setQuizResult,
    setRankingData,
  } = useGame((state) => ({
    setOnlinePlayers: state.setOnlinePlayers,
    setGameData: state.setGameData,
    setCounter: state.setCounter,
    setQuizData: state.setQuizData,
    setQuizResult: state.setQuizResult,
    setRankingData: state.setRankingData,
  }));
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
    socketConnection.on("data-ranking", (ranking: RankingItem[]) => {
      setRankingData(ranking);
    });
  }, [
    setClientId,
    setCounter,
    setGameData,
    setOnlinePlayers,
    setQuizData,
    setQuizResult,
    setRankingData,
  ]);

  const emitEvent = (
    event: string,
    args?: any,
    callback?: (response: any) => void
  ) => {
    if (socketConnection) {
      socketConnection.emit(event, args, callback);
    } else {
      const emitterInterval = setInterval(() => {
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
    return new Promise((resolve, reject) => {
      emitEvent("join-game", { pin, name }, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(true);
        }
      });
    });
  };

  const startGame = () => {
    emitEvent("start-game");
  };

  const initLive = () => {
    emitEvent("init-live");
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

  const goToNextStep = () => {
    emitEvent("next-resultstep");
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
    goToNextStep,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
