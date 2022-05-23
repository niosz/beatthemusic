import _ from "lodash";
import { Server } from "Socket.IO";
import {
  GameData,
  Players,
  QuizAnswer,
  QuizDataSend,
  QuizResult,
  SocketData,
} from "../../server_src/interfaces";
import {
  connectPlayer,
  events,
  SocketEvent,
} from "../../server_src/socket/events";
import { NOT_COUNTING } from "../../src/utils/const";

let gameData: GameData = {
  started: false,
  quizStarted: false,
  quizNumber: -1,
  startedTime: new Date(),
  pin: "",
};
let players: Players = {};
let counter = NOT_COUNTING;
let quizData: QuizDataSend = { q: "", answers: [] };
let quizAnswers: QuizAnswer = {};
let quizResult: QuizResult = { answers: [], correctAnswer: -1, title: "" };

const dataUpdater = (socketData: SocketData) => {
  gameData = socketData.gameData;
  counter = socketData.counter;
  players = socketData.players;
  quizData = socketData.quizData;
  quizAnswers = socketData.quizAnswers;
  quizResult = socketData.quizResult;
};

const SocketHandler = (req: any, res: any) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      connectPlayer(
        { gameData, counter, players, quizData, quizAnswers, quizResult },
        io,
        socket,
        dataUpdater
      );

      Object.keys(events).forEach((event) => {
        const eventType = event as SocketEvent;
        socket.on(event, (msg) => {
          const eventFn = events[eventType];
          eventFn(
            io,
            socket,
            { gameData, counter, players, quizData, quizAnswers, quizResult },
            msg,
            dataUpdater
          );
        });
      });
    });
  }
  res.end();
};

export default SocketHandler;
