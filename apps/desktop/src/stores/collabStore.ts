import { create } from 'zustand';
import { getSocket } from '../lib/socket';

export interface RemoteTransport {
  userId: string;
  displayName: string;
  colour: string;
  currentTime: number;
  isPlaying: boolean;
  at: number; // Date.now() of last tick
}

export interface RemoteDrag {
  userId: string;
  displayName: string;
  colour: string;
  liveOffset: number;
  at: number;
}

interface CollabState {
  projectId: string | null;
  // userId → most recent transport tick
  remoteTransports: Map<string, RemoteTransport>;
  // trackId → most recent remote drag for that clip (only one active drag per clip)
  remoteDrags: Map<string, RemoteDrag>;
  attach: (projectId: string) => void;
  detach: () => void;
}

let socketHandlersAttached = false;
let sweepTimer: ReturnType<typeof setInterval> | null = null;
const STALE_MS = 2500;

export const useCollabStore = create<CollabState>((set, get) => ({
  projectId: null,
  remoteTransports: new Map(),
  remoteDrags: new Map(),

  attach: (projectId) => {
    set({ projectId, remoteTransports: new Map(), remoteDrags: new Map() });

    const socket = getSocket();
    if (!socket) return;

    if (!socketHandlersAttached) {
      socket.on('transport:remote-tick', (msg) => {
        if (msg.projectId !== get().projectId) return;
        const next = new Map(get().remoteTransports);
        next.set(msg.userId, {
          userId: msg.userId,
          displayName: msg.displayName,
          colour: msg.colour,
          currentTime: msg.currentTime,
          isPlaying: msg.isPlaying,
          at: Date.now(),
        });
        set({ remoteTransports: next });
      });

      socket.on('clip:remote-drag', (msg) => {
        if (msg.projectId !== get().projectId) return;
        const next = new Map(get().remoteDrags);
        if (msg.liveOffset == null) {
          next.delete(msg.trackId);
        } else {
          next.set(msg.trackId, {
            userId: msg.userId,
            displayName: msg.displayName,
            colour: msg.colour,
            liveOffset: msg.liveOffset,
            at: Date.now(),
          });
        }
        set({ remoteDrags: next });
      });
      socketHandlersAttached = true;
    }

    // Garbage-collect ticks and drags that haven't been refreshed — keeps
    // ghost playheads from persisting after a collaborator disconnects and
    // prevents a stale drag lock from blocking everyone.
    if (!sweepTimer) {
      sweepTimer = setInterval(() => {
        const now = Date.now();
        const { remoteTransports, remoteDrags } = get();
        let tChanged = false;
        const tNext = new Map(remoteTransports);
        for (const [k, v] of remoteTransports) {
          if (now - v.at > STALE_MS) { tNext.delete(k); tChanged = true; }
        }
        let dChanged = false;
        const dNext = new Map(remoteDrags);
        for (const [k, v] of remoteDrags) {
          if (now - v.at > STALE_MS) { dNext.delete(k); dChanged = true; }
        }
        if (tChanged || dChanged) {
          set({ remoteTransports: tChanged ? tNext : remoteTransports, remoteDrags: dChanged ? dNext : remoteDrags });
        }
      }, 1000);
    }
  },

  detach: () => {
    set({ projectId: null, remoteTransports: new Map(), remoteDrags: new Map() });
    if (sweepTimer) { clearInterval(sweepTimer); sweepTimer = null; }
  },
}));
