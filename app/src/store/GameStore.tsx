import create from "zustand";
import {
  GameData,
  KeyboardMode,
  Players,
  QuizResult,
  RankingItem,
} from "../../server_src/interfaces";

export interface QuizData {
  q: string;
  video: string;
  keyboard: KeyboardMode;
  answers: string[];
}

export interface AnswerData {
  answerTime: number;
  answerIndex: number | boolean;
  answerScore: number;
  answerElapsed: number;
}

interface GameState {
  onlinePlayers: Players;
  setOnlinePlayers: (onlinePlayers: Players) => void;
  gameData: GameData;
  setGameData: (gd: GameData) => void;
  quizData: QuizData;
  setQuizData: (q: QuizData) => void;
  counter: number;
  setCounter: (c: number) => void;
  answerData: AnswerData;
  setAnswerData: (a: AnswerData) => void;
  quizResult: QuizResult;
  setQuizResult: (qr: QuizResult) => void;
  rankingData: RankingItem[];
  setRankingData: (ranking: RankingItem[]) => void;
}

export const useGame = create<GameState>((set) => ({
  onlinePlayers: {},
  setOnlinePlayers: (onlinePlayers) => set({ onlinePlayers }),
  gameData: {
    pin: "",
    quizNumber: 0,
    started: false,
    startedTime: 0,
    quizStarted: false,
    totalQuestions: -1,
    resultStep: -1,
    quizEnded: false,
  },
  setGameData: (gd) => set({ gameData: gd }),
  quizData: { q: "", video: "", answers: [], keyboard: "ABCD" },
  setQuizData: (q) => set({ quizData: q }),
  counter: -1,
  setCounter: (c) => set({ counter: c }),
  answerData: {
    answerIndex: -1,
    answerTime: 0,
    answerScore: 0,
    answerElapsed: 0,
  },
  setAnswerData: (a) => ({ answer: a }),
  quizResult: { answers: [], correctAnswer: -1, title: "" },
  setQuizResult: (qr) => set({ quizResult: qr }),
  rankingData: [],
  setRankingData: (ranking) => set({ rankingData: ranking }),
}));
