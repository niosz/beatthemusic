import _ from "lodash";
import { Server } from "socket.io";
import {
  GameData,
  Players,
  QuizAnswer,
  QuizResult,
  SocketData,
} from "../../server_src/interfaces";
import {
  connectPlayer,
  events,
  SocketEvent,
} from "../../server_src/socket/events";
import { QuizData } from "../../src/store/GameStore";
import { NOT_COUNTING } from "../../src/utils/const";

export const initialGameData: GameData = {
  quizFileIndex: 0,
  quizList: [],
  started: false,
  quizStarted: false,
  quizEnded: false,
  quizNumber: -1,
  totalQuestions: -1,
  startedTime: 0,
  pin: "",
  resultStep: -1,
  extraEventStarted: false,
  extraEventType: "ON_STAGE",
  onStageName: null,
  extraEventAnswered: null,
};

let gameData: GameData = { ...initialGameData };
let players: Players = {};
let counter = NOT_COUNTING;
let quizData: QuizData = { q: "", video: "", answers: [], keyboard: "ABCD" };
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
        {
          gameData,
          counter,
          players,
          quizData,
          quizAnswers,
          quizResult,
          quizFileIndex: 0,
        },
        io,
        socket,
        dataUpdater
      );

      Object.keys(events).forEach((event) => {
        const eventType = event as SocketEvent;
        socket.on(event, (msg, cbFn) => {
          const eventFn = events[eventType];
          eventFn(
            io,
            socket,
            {
              gameData,
              counter,
              players,
              quizData,
              quizAnswers,
              quizResult,
              quizFileIndex: 0,
            },
            msg,
            dataUpdater,
            cbFn
          );
        });
      });
    });
  }
  res.end();
};

export default SocketHandler;
