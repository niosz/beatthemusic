import { createContext, FC, useCallback, useContext, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { QuizResult } from "../../server_src/interfaces";
import { useGame } from "../store/GameStore";
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
});

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { setClientId } = usePlayer();
  const {
    setOnlinePlayers,
    setGameData,
    setCounter,
    setQuizData,
    setAnswer,
    setQuizResult,
  } = useGame();

  const socketInitializer = useCallback(async () => {
    await fetch("/api/socket");
    socketConnection = io();

    socketConnection.on("connect", () => {
      setClientId(socketConnection.id);
    });

    socketConnection.on("online-players", (msg) => {
      setOnlinePlayers(msg);
    });

    socketConnection.on("game-data", (msg) => {
      setGameData(msg);
    });

    socketConnection.on("quiz-counter", (counter) => {
      setCounter(counter);
    });

    socketConnection.on("quiz-data", (quiz) => {
      setQuizData(quiz);
    });

    socketConnection.on(
      "answer-data",
      (answer: { answerIndex: number; answerTime: number }) => {
        setAnswer({
          answerIndex: answer.answerIndex,
          answerTime: new Date(answer.answerTime),
        });
      }
    );
    socketConnection.on("quiz-result", (qr: QuizResult) => {
      setQuizResult(qr);
    });
  }, [
    setAnswer,
    setClientId,
    setCounter,
    setGameData,
    setOnlinePlayers,
    setQuizData,
    setQuizResult,
  ]);

  useEffect(() => {
    socketInitializer();
  }, [socketInitializer]);

  const joinServer = (pin: string, name: string) => {
    socketConnection.emit("join-game", { pin, name });
  };

  const startGame = () => {
    socketConnection.emit("start-game");
  };

  const initLive = () => {
    socketConnection.emit("game-data");
  };

  const endGame = () => {
    socketConnection.emit("end-game");
  };

  const startQuiz = () => {
    socketConnection.emit("start-quiz");
  };

  const answerQuestion = (i: number) => {
    socketConnection.emit("answer-question", i);
  };

  const endQuiz = () => {
    socketConnection.emit("end-quiz");
  };

  const value: ISocketContext = {
    joinServer,
    startGame,
    endGame,
    initLive,
    startQuiz,
    answerQuestion,
    endQuiz,
  };

  if (!socketConnection) {
    return null;
  }
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
