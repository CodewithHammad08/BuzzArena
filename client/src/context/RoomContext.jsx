/**
 * RoomContext – Global state for the current quiz room session.
 * Provides room data, team info, leaderboard, and quiz state to all components.
 */

import { createContext, useContext, useReducer, useCallback } from 'react';

const RoomContext = createContext(null);

const initialState = {
  // Room info
  roomCode: null,
  isHost: false,
  hostPassword: null,

  // Team info (for team view)
  teamName: null,
  members: [],

  // Room state (synced from server)
  locked: true,
  winner: null,
  roundNumber: 0,
  teams: [],       // [{ name, members, score, buzzWins }]
  history: [],     // [{ roundNumber, winner, reactionTime, scores }]

  // UI state
  countdown: null,        // null | 3 | 2 | 1 | 'GO'
  buzzStatus: 'idle',     // 'idle' | 'sent' | 'won' | 'lost'
  isConnected: false,
  isConnecting: false,
  quizEnded: false,
};

function roomReducer(state, action) {
  switch (action.type) {
    case 'SET_ROOM':
      return { ...state, ...action.payload };

    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload, isConnecting: false };

    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload };

    case 'TEAM_JOINED':
      return { ...state, teams: action.payload.teams };

    case 'LEADERBOARD_UPDATE':
      return { ...state, teams: action.payload.teams };

    case 'COUNTDOWN':
      return { ...state, countdown: action.payload.value };

    case 'ROUND_STARTED':
      return {
        ...state,
        locked: false,
        countdown: null,
        buzzStatus: 'idle',
        winner: null,
      };

    case 'WINNER':
      return {
        ...state,
        winner: action.payload.teamName,
        locked: true,
        buzzStatus: state.teamName === action.payload.teamName ? 'won' : 'lost',
        countdown: null,
      };

    case 'BUZZ_SENT':
      return { ...state, buzzStatus: 'sent' };

    case 'ROUND_RESET':
      return {
        ...state,
        winner: null,
        locked: true,
        buzzStatus: 'idle',
        countdown: null,
        roundNumber: action.payload.roundNumber,
        history: action.payload.history || state.history,
      };

    case 'ROOM_UPDATE':
      return { ...state, ...action.payload };

    case 'QUIZ_ENDED':
      return {
        ...state,
        quizEnded: true,
        teams: action.payload.leaderboard,
        history: action.payload.history,
      };

    case 'RESET_SESSION':
      return initialState;

    default:
      return state;
  }
}

export function RoomProvider({ children }) {
  const [state, dispatch] = useReducer(roomReducer, initialState);

  const setRoom = useCallback((payload) => dispatch({ type: 'SET_ROOM', payload }), []);
  const resetSession = useCallback(() => dispatch({ type: 'RESET_SESSION' }), []);

  return (
    <RoomContext.Provider value={{ state, dispatch, setRoom, resetSession }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomContext() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoomContext must be used inside RoomProvider');
  return ctx;
}

export default RoomContext;
