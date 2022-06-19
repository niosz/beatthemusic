import { QuizData } from "../src/store/GameStore";

export interface PlayerData {
  id: string;
  name: string;
  score: number;
  isOnline: boolean;
  isInRoom: boolean;
}

export type ExtraEvent = "ON_STAGE" | "VIDEO_PLAY";

interface QuizListItem {
  name: string;
}
export interface GameData {
  quizList: QuizListItem[];
  quizFileIndex: number;
  started: boolean;
  quizStarted: boolean;
  quizEnded: boolean;
  quizNumber: number;
  startedTime: number;
  pin: string;
  totalQuestions: number;
  resultStep: number;
  extraEventStarted: boolean;
  extraEventType: ExtraEvent;
  onStageName: string | null;
  extraEventAnswered: boolean | null;
}

export interface QuizEntry {
  active: boolean;
  title: string;
  questions: Question[];
}

export type KeyboardMode = "ABCD" | "TRUEFALSE";

interface Question {
  active: boolean;
  question: string;
  keyboard: KeyboardMode;
  answer: boolean | number;
  options?: string[];
  video: string;
  qvideo: string;
  qblur: boolean;
  blurImg: string;
  lyrics: string;
}

export interface RankingItem {
  name: string;
  score: number;
  roundTime: number;
  timeAvg: number;
  answeredQuestions: number;
}
export interface RankingData {
  [addr: string]: RankingItem;
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
  quizFileIndex: number;
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

export enum RESULT_STEP {
  CORRECT_ANSWER = 1,
  ANSWERS_SUMMARY = 2,
  RANKING = 3,
}
