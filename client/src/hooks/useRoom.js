/**
 * useRoom – Convenience hook for consuming RoomContext state.
 * Provides derived values and formatted data on top of raw context state.
 */

import { useMemo } from 'react';
import { useRoomContext } from '../context/RoomContext';

export function useRoom() {
  const { state, dispatch, setRoom, resetSession } = useRoomContext();

  const isWinner = useMemo(
    () => state.winner === state.teamName,
    [state.winner, state.teamName]
  );

  const isLocked = state.locked;
  const hasWinner = !!state.winner;
  const canBuzz = !isLocked && !hasWinner && state.buzzStatus === 'idle' && state.isConnected;

  const myTeam = useMemo(
    () => state.teams.find((t) => t.name === state.teamName),
    [state.teams, state.teamName]
  );

  const topTeam = useMemo(
    () => state.teams[0] || null,
    [state.teams]
  );

  return {
    ...state,
    isWinner,
    canBuzz,
    myTeam,
    topTeam,
    dispatch,
    setRoom,
    resetSession,
  };
}
