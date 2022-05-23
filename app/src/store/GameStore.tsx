import create from "zustand";
import { GameData, Players, QuizResult } from "../../server_src/interfaces";

interface QuizData {
  q: string;
  answers: string[];
}

interface AnswerData {
  answerTime: Date;
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
  answer: AnswerData;
  setAnswer: (a: AnswerData) => void;
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
    startedTime: new Date(),
    quizStarted: false,
  },
  setGameData: (gd) => set({ gameData: gd }),
  quizData: { q: "", answers: [] },
  setQuizData: (q) => set({ quizData: q }),
  counter: -1,
  setCounter: (c) => set({ counter: c }),
  answer: { answerIndex: -1, answerTime: new Date() },
  setAnswer: (a) => ({ answer: a }),
  quizResult: { answers: [], correctAnswer: -1, title: "" },
  setQuizResult: (qr) => set({ quizResult: qr }),
}));
