import create from "zustand";

interface PlayerState {
  clientId: string;
  setClientId: (clientId: string) => void;

  playerData: any;
  setPlayerData: (playerData: any) => void;

  score: number;
  setScore: (score: number) => void;
}

export const usePlayer = create<PlayerState>((set) => ({
  clientId: "",
  setClientId: (clientId) => set({ clientId }),

  playerData: null,
  setPlayerData: (playerData) => set({ playerData }),

  score: 0,
  setScore: (score) => set({ score }),
}));
