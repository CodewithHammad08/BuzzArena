/**
 * useSocket – Main hook for Socket.IO event management.
 * Connects the socket, registers all event listeners, and dispatches
 * state updates to RoomContext.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { socket } from '../socket/socket';
import { useRoomContext } from '../context/RoomContext';
import { useSound } from './useSound';

export function useSocket() {
  const { dispatch } = useRoomContext();
  const navigate = useNavigate();
  const { playBuzz } = useSound();
  const listenersRegistered = useRef(false);

  // Register socket event listeners once
  useEffect(() => {
    if (listenersRegistered.current) return;
    listenersRegistered.current = true;

    // Connection state
    socket.on('connect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    socket.on('disconnect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: false });
      toast.error('Connection lost. Reconnecting...', { id: 'disconnect-toast' });
    });

    socket.on('connect_error', () => {
      dispatch({ type: 'SET_CONNECTING', payload: false });
    });

    // Room updates
    socket.on('room-update', (data) => {
      dispatch({ type: 'ROOM_UPDATE', payload: data });
    });

    // Team joined
    socket.on('team-joined', (data) => {
      dispatch({ type: 'TEAM_JOINED', payload: data });
      toast.success(`${data.teamName} joined the arena!`, {
        icon: '⚡',
        style: { fontWeight: '600' },
      });
    });

    // Team removed
    socket.on('team-removed', (data) => {
      toast(`${data.teamName} was removed`, { icon: '🚫' });
    });

    // Countdown tick
    socket.on('countdown', (data) => {
      dispatch({ type: 'COUNTDOWN', payload: data });
    });

    // Round started (GO emitted)
    socket.on('round-started', (data) => {
      dispatch({ type: 'ROUND_STARTED', payload: data });
    });

    // Winner announced
    socket.on('winner', (data) => {
      dispatch({ type: 'WINNER', payload: data });
      playBuzz();
    });

    // Buzz too late (only this client)
    socket.on('buzz-too-late', () => {
      dispatch({ type: 'WINNER', payload: { teamName: '__other__' } });
    });

    // Leaderboard updated
    socket.on('leaderboard-update', (data) => {
      dispatch({ type: 'LEADERBOARD_UPDATE', payload: data });
    });

    // Round reset
    socket.on('round-reset', (data) => {
      dispatch({ type: 'ROUND_RESET', payload: data });
      toast('Round reset — get ready!', { icon: '🔄' });
    });

    // Quiz ended
    socket.on('quiz-ended', (data) => {
      dispatch({ type: 'QUIZ_ENDED', payload: data });
      navigate('/results');
    });

    // Server error
    socket.on('error', (data) => {
      toast.error(data.message || 'Something went wrong');
      dispatch({ type: 'SET_CONNECTING', payload: false });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('room-update');
      socket.off('team-joined');
      socket.off('team-removed');
      socket.off('countdown');
      socket.off('round-started');
      socket.off('winner');
      socket.off('buzz-too-late');
      socket.off('leaderboard-update');
      socket.off('round-reset');
      socket.off('quiz-ended');
      socket.off('error');
      listenersRegistered.current = false;
    };
  }, [dispatch, navigate, playBuzz]);

  /**
   * Connect and join a room.
   */
  const joinRoom = useCallback(({ roomCode, teamName, members, isHost, hostPassword }) => {
    dispatch({ type: 'SET_CONNECTING', payload: true });

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join-room', { roomCode, teamName, members, isHost, hostPassword });
  }, [dispatch]);

  /**
   * Press the buzzer.
   */
  const buzz = useCallback(({ roomCode, teamName }) => {
    dispatch({ type: 'BUZZ_SENT' });
    socket.emit('buzz', { roomCode, teamName });
  }, [dispatch]);

  /**
   * Start the round countdown (host only).
   */
  const startRound = useCallback(({ roomCode, hostPassword }) => {
    socket.emit('start-round', { roomCode, hostPassword });
  }, []);

  /**
   * Reset the round (host only).
   */
  const resetRound = useCallback(({ roomCode, hostPassword }) => {
    socket.emit('reset-round', { roomCode, hostPassword });
  }, []);

  /**
   * Submit a score change (host only).
   */
  const submitScore = useCallback(({ roomCode, hostPassword, teamName, delta }) => {
    socket.emit('submit-score', { roomCode, hostPassword, teamName, delta });
  }, []);

  /**
   * Lock buzzers manually (host only).
   */
  const lockBuzzers = useCallback(({ roomCode, hostPassword }) => {
    socket.emit('lock-buzzers', { roomCode, hostPassword });
  }, []);

  /**
   * Remove a team (host only).
   */
  const removeTeam = useCallback(({ roomCode, hostPassword, teamName }) => {
    socket.emit('remove-team', { roomCode, hostPassword, teamName });
  }, []);

  /**
   * Edit a team name (host only).
   */
  const editTeam = useCallback(({ roomCode, hostPassword, oldName, newName }) => {
    socket.emit('edit-team', { roomCode, hostPassword, oldName, newName });
  }, []);

  /**
   * End the quiz (host only).
   */
  const endQuiz = useCallback(({ roomCode, hostPassword }) => {
    socket.emit('end-quiz', { roomCode, hostPassword });
  }, []);

  /**
   * Disconnect socket.
   */
  const disconnect = useCallback(() => {
    socket.disconnect();
  }, []);

  return {
    joinRoom,
    buzz,
    startRound,
    resetRound,
    submitScore,
    lockBuzzers,
    removeTeam,
    editTeam,
    endQuiz,
    disconnect,
  };
}
