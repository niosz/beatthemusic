import _ from "lodash";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { initialGameData } from "../../pages/api/socket";
import { networkInterfaces } from "os";

import {
  GAME_STARTING,
  NOT_COUNTING,
  SHOW_RESULTS,
} from "../../src/utils/const";
import {
  Players,
  QuizAnswer,
  QuizEntry,
  QuizResultAnswer,
  RankingData,
  SingleAnswer,
  SocketData,
} from "../interfaces";
import BadWords from "bad-words";

export type SocketEvent =
  | "init-live"
  | "start-game"
  | "end-game"
  | "join-game"
  | "disconnect"
  | "start-quiz"
  | "answer-question"
  | "end-quiz"
  | "next-resultstep"
  | "start-extraevent"
  | "answer-extraevent";

type IIO = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
type ISocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;
const quizFiles = require("fs")
  .readdirSync("./server_src/quiz/")
  .filter((file: string) => file.endsWith(".json"))
  .map((file: string) => require(`../quiz/${file}`)) as QuizEntry[];

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
    updateData: (gameState: SocketData) => void,
    cbFn?: (response: any) => void
  ) => void;
};

export const getOnlinePlayers = (players: Players) => {
  return _.pickBy(players, (user) => user.isOnline && user.isInRoom);
};

const BWFilter = new BadWords();

const getAnswerScore = (gameState: SocketData, answerIndex: number) => {
  const qNumber = gameState.gameData.quizNumber;
  const correctAnswer =
    quizFiles[gameState.gameData.quizFileIndex].questions[qNumber].answer;

  const isTrueFalse = gameState.quizData.keyboard === "TRUEFALSE";

  const isCorrect =
    (isTrueFalse ? (answerIndex === 0 ? true : false) : answerIndex) ===
    correctAnswer;

  let score = 0;
  if (isCorrect) {
    score = 1;
    const addrKeys = Object.keys(gameState.quizAnswers[qNumber]);
    if (addrKeys && addrKeys.length > 0) {
      // There are answers, but wrong
      const noCorrectAnswers = addrKeys.every((addr) => {
        const answerItem = gameState.quizAnswers[qNumber][addr];
        return answerItem.answerIndex !== correctAnswer;
      });
      if (noCorrectAnswers) {
        score = 2;
      }
    } else {
      // There are no answers yet, 2 points
      score = 2;
    }
  }
  return score;
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
  emitData(gameState, io);
};

export const emitData = (
  gameState: SocketData,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  gameState.gameData.quizList = quizFiles.map((quiz) => {
    return {
      name: quiz.title,
    };
  });

  io.emit("online-players", getOnlinePlayers(gameState.players));
  io.emit("game-data", gameState.gameData);
  io.emit("quiz-counter", gameState.counter);
  io.emit("quiz-data", gameState.quizData);
  io.emit("quiz-result", gameState.quizResult);

  emitRanking(gameState, io);
  io.fetchSockets().then((sockets) => {
    sockets.forEach((socketItem) => {
      const addr = socketItem.handshake.address;
      const qNumber = gameState.gameData.quizNumber;
      let clientQuizAnswer: SingleAnswer = {
        answerIndex: -1,
        answerTime: new Date(),
        answerScore: 0,
        answerElapsed: 0,
      };

      if (
        qNumber > -1 &&
        gameState.quizAnswers[gameState.gameData.quizNumber][addr]
      ) {
        clientQuizAnswer =
          gameState.quizAnswers[gameState.gameData.quizNumber][addr];
      }
      socketItem.emit("answer-data", {
        answerIndex: clientQuizAnswer.answerIndex,
        answerTime: clientQuizAnswer.answerTime.getTime(),
        answerScore: clientQuizAnswer.answerScore,
        answerElapsed: clientQuizAnswer.answerElapsed,
      });
    });
  });
};

const getCurrentRanking = (data: QuizAnswer, players: Players) => {
  let ranking: RankingData = {};
  Object.keys(data).forEach((quizQ) => {
    const quizQN = parseInt(quizQ, 10);
    Object.keys(data[quizQN]).forEach((item) => {
      if (ranking[item]) {
        ranking[item].score =
          ranking[item].score + data[quizQN][item].answerScore;
        ranking[item].roundTime = data[quizQN][item].answerElapsed;
        ranking[item].answeredQuestions = ranking[item].answeredQuestions + 1;
        ranking[item].timeAvg =
          ranking[item].timeAvg + data[quizQN][item].answerElapsed;
      } else {
        ranking[item] = {
          name: players[item].name,
          score: data[quizQN][item].answerScore,
          roundTime: data[quizQN][item].answerElapsed,
          timeAvg: data[quizQN][item].answerElapsed,
          answeredQuestions: 1,
        };
      }
    });
  });

  const rankingArray = Object.keys(ranking).map((rankingItem) => {
    ranking[rankingItem].timeAvg =
      ranking[rankingItem].timeAvg / ranking[rankingItem].answeredQuestions;
    return ranking[rankingItem];
  });

  return _.sortBy(rankingArray, (el) => el.score)
    .reverse()
    .slice(0, 15);
};

const emitRanking = (gameState: SocketData, io: IIO) => {
  const ranking = getCurrentRanking(gameState.quizAnswers, gameState.players);

  io.fetchSockets().then((sockets) => {
    const liveSockets = sockets.filter((socket) => {
      return socket.data.liveInstance;
    });

    liveSockets.forEach((socket) => {
      socket.emit("data-ranking", ranking);
    });
  });
};

const getInternalIP = () => {
  const address = _(networkInterfaces())
    .values()
    .map((a) => _.find(a, { family: "IPv4" }))
    .compact()
    .map("address")
    .value()
    .find((ip) => ip !== "127.0.0.1");
  return address || "";
};

export const events: EventData = {
  "init-live": (io, socket, gameState, msg, updateData, cbFn) => {
    socket.data = { liveInstance: true };
    socket.emit("game-data", gameState.gameData);
    const ip = getInternalIP();
    cbFn!(ip);
  },
  "end-game": (io, socket, gameState, msg, updateData) => {
    gameState.gameData = { ...initialGameData };
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
    gameState.quizAnswers = {};
    updateData(gameState);
    emitData(gameState, io);
  },
  "start-game": (io, socket, gameState, msg, updateData) => {
    gameState.gameData.quizFileIndex = msg as number;
    gameState.gameData.started = true;
    gameState.gameData.quizStarted = false;
    gameState.gameData.startedTime = new Date().getTime();
    gameState.gameData.pin = _.range(0, 6)
      .map(() => _.random(0, 9))
      .join("");
    gameState.counter = NOT_COUNTING;
    updateData(gameState);
    emitData(gameState, io);
  },
  "start-quiz": (io, socket, gameState, msg, updateData) => {
    gameState.gameData.resultStep = -1;
    gameState.counter = 3;
    gameState.gameData.quizNumber = gameState.gameData.quizNumber + 1;
    gameState.gameData.quizStarted = true;
    gameState.quizAnswers[gameState.gameData.quizNumber] = {};
    gameState.gameData.totalQuestions =
      quizFiles[gameState.gameData.quizFileIndex].questions.length;
    gameState.gameData.extraEventAnswered = null;
    gameState.gameData.extraEventStarted = false;
    gameState.gameData.onStageName = null;

    emitData(gameState, io);
    io.emit("quiz-counter", GAME_STARTING);
    const counterInterval = setInterval(() => {
      io.emit("quiz-counter", gameState.counter);
      if (gameState.counter === 0) {
        const quizItem =
          quizFiles[gameState.gameData.quizFileIndex].questions[
            gameState.gameData.quizNumber
          ];
        gameState.quizData = {
          q: quizItem.question,
          video: quizItem.video,
          keyboard: quizItem.keyboard,
          answers:
            quizItem.keyboard === "TRUEFALSE" ? ["V", "F"] : quizItem.options!,
        };
        io.emit("quiz-data", gameState.quizData);
        clearInterval(counterInterval);
        gameState.gameData.startedTime = new Date().getTime();
        updateData(gameState);
      } else {
        gameState.counter--;
        updateData(gameState);
      }
    }, 1000);
  },
  "join-game": (io, socket, gameState, msg, updateData, cbFn) => {
    const addr = socket.handshake.address;
    if (msg.pin === gameState.gameData.pin && gameState.gameData.started) {
      gameState.players[addr].id = socket.id;
      gameState.players[addr].isOnline = true;
      const takenNames = Object.keys(gameState.players)
        .map((pKey) => {
          return gameState.players[pKey].name;
        })
        .filter((name) => {
          return name !== "";
        });

      if (!takenNames.includes(msg.name)) {
        if (BWFilter.isProfane(msg.name)) {
          cbFn!({ error: "IS_PROFANE" });
        } else {
          gameState.players[addr].name = msg.name;
          gameState.players[addr].isInRoom = true;
        }
      } else {
        cbFn!({ error: "ALREADY_TAKEN" });
      }
      updateData(gameState);
      emitData(gameState, io);
    } else {
      cbFn!({ error: "WRONG_PIN" });
    }
  },
  disconnect: (io, socket, gameState, msg, updateData) => {
    const addr = socket.handshake.address;
    if (!socket.data.liveInstance) {
      gameState.players[addr].isOnline = false;
      updateData(gameState);
      emitData(gameState, io);
    }
  },
  "answer-question": (io, socket, gameState, answerIndex, updateData) => {
    const addr = socket.handshake.address;
    const answerScore = getAnswerScore(gameState, answerIndex);
    const isTrueFalse = gameState.quizData.keyboard === "TRUEFALSE";
    const answerResult = {
      answerIndex: isTrueFalse
        ? answerIndex === 0
          ? true
          : false
        : answerIndex,
      answerTime: new Date(),
      answerScore,
      answerElapsed: new Date().getTime() - gameState.gameData.startedTime,
    };

    if (!gameState.quizAnswers[gameState.gameData.quizNumber]) {
      gameState.quizAnswers[gameState.gameData.quizNumber] = {};
    }

    gameState.quizAnswers[gameState.gameData.quizNumber][addr] = answerResult;

    updateData(gameState);
    emitData(gameState, io);
  },
  "end-quiz": (io, socket, gameState, msg, updateData) => {
    gameState.counter = SHOW_RESULTS;
    gameState.gameData.resultStep = 0;
    const quizNumber = gameState.gameData.quizNumber;
    const quizQuestion =
      quizFiles[gameState.gameData.quizFileIndex].questions[quizNumber];
    gameState.gameData.quizEnded =
      quizNumber + 1 ===
      quizFiles[gameState.gameData.quizFileIndex].questions.length;

    let options;
    switch (quizQuestion.keyboard) {
      case "ABCD":
        options = quizQuestion.options?.map((q, i) => i);
        break;
      case "TRUEFALSE":
        options = [true, false];
    }

    const resultsByAnswer: QuizResultAnswer[] = options!.map((q, i) => {
      return {
        answerCode: _.isBoolean(q)
          ? ["V", "F"][i]
          : String.fromCharCode(65 + i),
        people: Object.keys(
          _.pickBy(gameState.quizAnswers[quizNumber], (addr) => {
            return addr.answerIndex === q;
          })
        ).length,
      };
    });

    gameState.quizResult = {
      title: quizFiles[gameState.gameData.quizFileIndex].title,
      correctAnswer: quizQuestion.answer,
      answers: resultsByAnswer,
    };

    updateData(gameState);
    emitData(gameState, io);
  },
  "next-resultstep": (io, socket, gameState, msg, updateData) => {
    const resStep = gameState.gameData.resultStep;
    gameState.gameData.extraEventStarted = false;
    gameState.gameData.extraEventAnswered = null;
    gameState.gameData.onStageName = null;
    if (resStep === 3) {
      events["end-game"](io, socket, gameState, msg, updateData);
      return;
    }
    if (resStep < 2 || (resStep === 2 && gameState.gameData.quizEnded)) {
      gameState.gameData.resultStep = resStep + 1;
      updateData(gameState);
      emitData(gameState, io);
    } else {
      events["start-quiz"](io, socket, gameState, msg, updateData);
    }
  },
  "start-extraevent": (io, socket, gameState, msg, updateData) => {
    gameState.gameData.extraEventStarted = true;
    gameState.gameData.started = true;
    gameState.gameData.extraEventType = msg.type;
    gameState.gameData.onStageName = null;
    gameState.gameData.extraEventAnswered = null;
    if (gameState.gameData.extraEventType === "ON_STAGE") {
      setTimeout(() => {
        // get random player from gameState.players
        const randomPlayer = _.sample(Object.values(gameState.players));
        if (randomPlayer) {
          gameState.gameData.onStageName = randomPlayer.name;
        }
        updateData(gameState);
        emitData(gameState, io);
      }, 5000);
    }
    updateData(gameState);
    emitData(gameState, io);
  },
  "answer-extraevent": (io, socket, gameState, msg, updateData) => {
    const addr = socket.handshake.address;
    const player = gameState.players[addr];

    if (
      gameState.gameData.extraEventStarted &&
      player.name === gameState.gameData.onStageName
    ) {
      gameState.gameData.extraEventAnswered = msg;
      updateData(gameState);
      emitData(gameState, io);
    }
  },
};
