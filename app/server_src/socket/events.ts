import _ from "lodash";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import {
  GAME_STARTING,
  NOT_COUNTING,
  SHOW_RESULTS,
} from "../../src/utils/const";
import {
  Players,
  QuizEntry,
  QuizResultAnswer,
  SocketData,
} from "../interfaces";

export type SocketEvent =
  | "start-game"
  | "end-game"
  | "join-game"
  | "disconnect"
  | "live-data"
  | "start-quiz"
  | "answer-question"
  | "end-quiz";

type IIO = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
type ISocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

export interface EventDataFn {
  io: IIO;
  socket: ISocket;
  gameState: SocketData;
  msg: any;
  updateData: (gameState: SocketData) => void;
}

type EventData = {
  [k in SocketEvent]: (
    io: IIO,
    socket: ISocket,
    gameState: SocketData,
    msg: any,
    updateData: (gameState: SocketData) => void
  ) => void;
};

export const getOnlinePlayers = (players: Players) => {
  return _.pickBy(players, (user) => user.isOnline && user.isInRoom);
};

export const connectPlayer = (
  gameState: SocketData,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  updateData: (gameState: SocketData) => void
) => {
  const addr = socket.handshake.address;
  const id = socket.id;
  if (!gameState.players[addr]) {
    gameState.players[addr] = {
      name: "",
      score: 0,
      isOnline: true,
      isInRoom: false,
      id,
    };
  } else {
    gameState.players[addr].isOnline = true;
    gameState.players[addr].id = id;
  }
  updateData(gameState);
  emitData(gameState, io, socket);
};

const quiz = require("./../quiz_001.json") as QuizEntry;

export const emitData = (
  gameState: SocketData,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
) => {
  const addr = socket.handshake.address;
  io.emit("online-players", getOnlinePlayers(gameState.players));
  io.emit("game-data", gameState.gameData);
  io.emit("quiz-counter", gameState.counter);
  io.emit("quiz-data", gameState.quizData);
  io.emit("quiz-result", gameState.quizResult);

  const qAnswer = gameState.quizAnswers[addr] || {
    answerIndex: -1,
    answerTime: new Date(),
  };
  socket.emit(
    "answer-data",
    {
      answerIndex: qAnswer.answerIndex,
      answerTime: qAnswer.answerTime.getTime(),
    } || {}
  );
};

export const events: EventData = {
  "live-data": (io, socket, gameState, msg) => {
    socket.emit("game-data", gameState.gameData);
  },
  "end-game": (io, socket, gameState, msg, updateData) => {
    gameState.gameData.started = false;
    gameState.gameData.quizStarted = false;
    gameState.gameData.quizNumber = -1;
    gameState.gameData.startedTime = new Date();
    gameState.gameData.pin = "";
    Object.keys(gameState.players).forEach((pKey) => {
      const currPlayer = gameState.players[pKey];
      gameState.players[pKey] = {
        ...currPlayer,
        name: "",
        score: 0,
        isInRoom: false,
      };
    });
    gameState.players = _.pickBy(gameState.players, (p) => {
      return p.isOnline;
    });
    gameState.counter = NOT_COUNTING;
    updateData(gameState);
    emitData(gameState, io, socket);
  },
  "start-game": (io, socket, gameState, msg, updateData) => {
    gameState.gameData.started = true;
    gameState.gameData.quizStarted = false;
    gameState.gameData.startedTime = new Date();
    gameState.gameData.pin = _.range(0, 6)
      .map(() => _.random(0, 9))
      .join("");
    gameState.counter = NOT_COUNTING;
    updateData(gameState);
    emitData(gameState, io, socket);
  },
  "start-quiz": (io, socket, gameState, msg, updateData) => {
    gameState.counter = 3;
    gameState.gameData.quizNumber = gameState.gameData.quizNumber + 1;
    gameState.gameData.quizStarted = true;
    io.emit("game-data", gameState.gameData);
    io.emit("quiz-counter", GAME_STARTING);
    const counterInterval = setInterval(() => {
      io.emit("quiz-counter", gameState.counter);
      if (gameState.counter === 0) {
        const quizItem = quiz.questions[gameState.gameData.quizNumber];
        console.log(quizItem);
        gameState.quizData = {
          q: quizItem.video,
          answers: _.range(0, quizItem.answers).map((i) => `q${i}`),
        };
        io.emit("quiz-data", gameState.quizData);
        clearInterval(counterInterval);
        gameState.gameData.startedTime = new Date();
        updateData(gameState);
      } else {
        gameState.counter--;
        updateData(gameState);
      }
    }, 1000);
  },
  "join-game": (io, socket, gameState, msg, updateData) => {
    const addr = socket.handshake.address;
    if (msg.pin === gameState.gameData.pin && gameState.gameData.started) {
      gameState.players[addr].id = socket.id;
      gameState.players[addr].isOnline = true;
      gameState.players[addr].name = msg.name;
      gameState.players[addr].isInRoom = true;
      updateData(gameState);
      emitData(gameState, io, socket);
    }
  },
  disconnect: (io, socket, gameState, msg, updateData) => {
    const addr = socket.handshake.address;
    gameState.players[addr].isOnline = false;
    updateData(gameState);
    emitData(gameState, io, socket);
  },
  "answer-question": (io, socket, gameState, msg, updateData) => {
    const addr = socket.handshake.address;
    gameState.quizAnswers[addr] = {
      answerIndex: msg,
      answerTime: new Date(),
    };

    updateData(gameState);
    emitData(gameState, io, socket);
  },
  "end-quiz": (io, socket, gameState, msg, updateData) => {
    gameState.counter = SHOW_RESULTS;
    const quizQuestion = quiz.questions[gameState.gameData.quizNumber];
    const resultsByAnswer: QuizResultAnswer[] = _.range(
      0,
      quizQuestion.isTrueFalse ? 2 : 4
    ).map((i) => {
      return {
        answerCode: String.fromCharCode(65 + i),
        people: Object.keys(
          _.pickBy(gameState.quizAnswers, (q) => {
            return q.answerIndex === i;
          })
        ).length,
      };
    });
    gameState.quizResult = {
      title: quiz.title,
      correctAnswer: quizQuestion.answer,
      answers: resultsByAnswer,
    };

    updateData(gameState);
    emitData(gameState, io, socket);
  },
};
