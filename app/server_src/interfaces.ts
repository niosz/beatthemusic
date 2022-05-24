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
}

export interface QuizEntry {
  title: string;
  questions: Question[];
}

interface Question {
  isTrueFalse: boolean;
  answer: number;
  video: string;
}

export interface QuizDataSend {
  q: string;
  answers: string[];
}

export interface Players {
  [id: string]: PlayerData;
}

export interface QuizAnswer {
  [addr: string]: {
    answerTime: Date;
    answerIndex: number;
  };
}

export interface SocketData {
  gameData: GameData;
  players: Players;
  quizData: QuizDataSend;
  counter: number;
  quizAnswers: QuizAnswer;
  quizResult: QuizResult;
}

export interface QuizResult {
  title: string;
  correctAnswer: number;
  answers: QuizResultAnswer[];
}

export interface QuizResultAnswer {
  answerCode: string;
  people: number;
}
