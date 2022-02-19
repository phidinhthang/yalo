import { combine } from 'zustand/middleware';
import create from 'zustand';
import { Socket } from 'socket.io-client';

export const useWsStore = create(
  combine(
    {
      ws: null as Socket | null,
    },
    (set) => ({
      setWs: (ws: Socket | null) => set({ ws }),
    })
  )
);
