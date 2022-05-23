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
  startedTime: Date;
  pin: string;
}

export interface QuizEntry {
  title: string;
  questions: Question[];
}

interface Question {
  isTrueFalse: boolean;
  answer: number;
  answers: number;
  video: string;
}

// export interface QuizEntry {
//   quizData: QuizData;
// }

// interface QuizData {
//   questions: Question[];
// }

export interface QuizDataSend {
  q: string;
  answers: string[];
}

// interface Question {
//   q: string;
//   answers: number[];
//   answerIndex: number;
// }

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
