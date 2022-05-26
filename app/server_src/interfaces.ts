import { QuizData } from "../src/store/GameStore";

export interface PlayerData {
  id: string;
  name: string;
  score: number;
  isOnline: boolean;
  isInRoom: boolean;
}

export interface GameData {
  started: boolean;
  quizStarted: boolean;
  quizNumber: number;
  startedTime: number;
  pin: string;
  totalQuestions: number;
  resultStep: number;
}

export interface QuizEntry {
  active: boolean;
  title: string;
  questions: Question[];
}

interface Question {
  active: boolean;
  question: string;
  keyboard: "ABCD" | "TRUEFALSE";
  answer: boolean | number;
  options?: string[];
  video: string;
}

// export interface QuizEntry {
//   title: string;
//   questions: Question[];
// }

// interface Question {
//   isTrueFalse: boolean;
//   answer: number;
//   video: string;
// }

export interface Players {
  [id: string]: PlayerData;
}

export interface SingleAnswer {
  answerTime: Date;
  answerIndex: number | boolean;
  answerScore: number;
  answerElapsed: number;
}

export interface QuizAnswer {
  [q: number]: {
    [addr: string]: SingleAnswer;
  };
}

export interface SocketData {
  gameData: GameData;
  players: Players;
  quizData: QuizData;
  counter: number;
  quizAnswers: QuizAnswer;
  quizResult: QuizResult;
}

export interface QuizResult {
  title: string;
  correctAnswer: number | boolean;
  answers: QuizResultAnswer[];
}

export interface QuizResultAnswer {
  answerCode: string;
  people: number;
}
