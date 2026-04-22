import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from '@ghost/protocol';

type GhostSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export function registerSessionHandlers(io: Server, socket: GhostSocket) {
  socket.on('session-action', ({ projectId, action }) => {
    // Broadcast to everyone in the room except sender
    socket.to(`project:${projectId}`).emit('session-action', { action });
  });

  socket.on('transport-sync', ({ projectId, beatPosition }) => {
    socket.to(`project:${projectId}`).emit('transport-sync', {
      beatPosition,
      serverTimestamp: Date.now(),
    });
  });

  // Live playhead relay — enriches the tick with the emitter's profile so
  // receivers can colour-code their ghost playhead and caption it.
  socket.on('transport:tick', ({ projectId, currentTime, isPlaying }) => {
    socket.to(`project:${projectId}`).emit('transport:remote-tick', {
      projectId,
      userId: socket.data.userId,
      displayName: socket.data.displayName,
      colour: socket.data.colour,
      currentTime,
      isPlaying,
    });
  });

  // Live clip-drag relay — same enrichment. liveOffset:null signals the drag
  // ended so every client can clear its remote-drag state for that clip.
  socket.on('clip:drag', ({ projectId, trackId, liveOffset }) => {
    socket.to(`project:${projectId}`).emit('clip:remote-drag', {
      projectId,
      userId: socket.data.userId,
      displayName: socket.data.displayName,
      colour: socket.data.colour,
      trackId,
      liveOffset,
    });
  });
}
