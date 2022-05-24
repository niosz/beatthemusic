import create from "zustand";
import { GameData, Players, QuizResult } from "../../server_src/interfaces";

export interface QuizData {
  q: string;
  answers: string[];
}

export interface AnswerData {
  answerTime: number;
  answerIndex: number;
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
  },
  setGameData: (gd) => set({ gameData: gd }),
  quizData: { q: "", answers: [] },
  setQuizData: (q) => set({ quizData: q }),
  counter: -1,
  setCounter: (c) => set({ counter: c }),
  answerData: { answerIndex: -1, answerTime: 0 },
  setAnswerData: (a) => ({ answer: a }),
  quizResult: { answers: [], correctAnswer: -1, title: "" },
  setQuizResult: (qr) => set({ quizResult: qr }),
}));
