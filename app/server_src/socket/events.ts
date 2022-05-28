import _ from "lodash";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { initialGameData } from "../../pages/api/socket";
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

export type SocketEvent =
  | "init-live"
  | "start-game"
  | "end-game"
  | "join-game"
  | "disconnect"
  | "start-quiz"
  | "answer-question"
  | "end-quiz"
  | "next-resultstep";

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
    updateData: (gameState: SocketData) => void,
    cbFn?: (response: any) => void
  ) => void;
};

export const getOnlinePlayers = (players: Players) => {
  return _.pickBy(players, (user) => user.isOnline && user.isInRoom);
};

const getAnswerScore = (gameState: SocketData, answerIndex: number) => {
  const qNumber = gameState.gameData.quizNumber;
  const correctAnswer = quiz.questions[qNumber].answer;
  const isCorrect = answerIndex === correctAnswer;
  let score = 0;
  if (isCorrect) {
    score = 1;
    const addrKeys = Object.keys(gameState.quizAnswers[qNumber]);
    if (addrKeys && addrKeys.length > 0) {
      addrKeys.forEach((addr) => {
        const answerItem = gameState.quizAnswers[qNumber][addr];
        if (answerItem.answerIndex !== correctAnswer) {
          score = 2;
        }
      });
    } else {
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

const quiz = require("./../q001.json") as QuizEntry;

export const emitData = (
  gameState: SocketData,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
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

export const events: EventData = {
  "init-live": (io, socket, gameState, msg) => {
    socket.data = { liveInstance: true };
    socket.emit("game-data", gameState.gameData);
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
    gameState.gameData.totalQuestions = quiz.questions.length;
    emitData(gameState, io);
    io.emit("quiz-counter", GAME_STARTING);
    const counterInterval = setInterval(() => {
      io.emit("quiz-counter", gameState.counter);
      if (gameState.counter === 0) {
        const quizItem = quiz.questions[gameState.gameData.quizNumber];
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
      gameState.players[addr].name = msg.name;
      gameState.players[addr].isInRoom = true;
      updateData(gameState);
      emitData(gameState, io);
    } else {
      if (cbFn) {
        cbFn({ error: "WRONG_PIN" });
      }
    }
  },
  disconnect: (io, socket, gameState, msg, updateData) => {
    const addr = socket.handshake.address;
    gameState.players[addr].isOnline = false;
    updateData(gameState);
    emitData(gameState, io);
  },
  "answer-question": (io, socket, gameState, answerIndex, updateData) => {
    const addr = socket.handshake.address;
    const answerScore = getAnswerScore(gameState, answerIndex);

    const answerResult = {
      answerIndex,
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
    const quizQuestion = quiz.questions[quizNumber];
    gameState.gameData.quizEnded = quizNumber + 1 === quiz.questions.length;

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
      title: quiz.title,
      correctAnswer: quizQuestion.answer,
      answers: resultsByAnswer,
    };

    updateData(gameState);
    emitData(gameState, io);
  },
  "next-resultstep": (io, socket, gameState, msg, updateData) => {
    const resStep = gameState.gameData.resultStep;
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
};
