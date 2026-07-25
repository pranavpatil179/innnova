// State manager for the autonomous assistant agent
// Maintains persistent task-state per run, survives page refresh
// State is stored in-memory (per server instance) and also sent to client

class StateManager {
  constructor() {
    // In-memory store: sessionId -> taskState
    this.sessions = new Map();
  }

  createSession(sessionId) {
    const state = {
      sessionId: sessionId,
      original_instruction: null,
      extracted_parameters: {},
      subtasks: [],
      action_log: [],
      bookings: {
        flights: [],
        hotels: [],
        restaurants: [],
        calendar: []
      },
      current_step: 0,
      status: 'idle', // idle, planning, executing, completed, failed, needs_clarification
      clarification_question: null,
      final_summary: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add helper methods that reference this stateManager instance
    const self = this;
    state.logAction = function(action) {
      return self._logAction(sessionId, action);
    };
    state.setFinalSummary = function(summary) {
      return self._setFinalSummary(sessionId, summary);
    };

    this.sessions.set(sessionId, state);
    return state;
  }

  getSession(sessionId) {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = this.createSession(sessionId);
    }
    return session;
  }

  updateSession(sessionId, updates) {
    const session = this.getSession(sessionId);
    Object.assign(session, updates, { updated_at: new Date().toISOString() });
    return session;
  }

  _logAction(sessionId, action) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    session.action_log.push({
      ...action,
      timestamp: action.timestamp || new Date().toISOString()
    });
    session.updated_at = new Date().toISOString();
    return session;
  }

  logAction(sessionId, action) {
    return this._logAction(sessionId, action);
  }

  addBooking(sessionId, type, booking) {
    const session = this.getSession(sessionId);
    if (session.bookings[type]) {
      session.bookings[type].push(booking);
    }
    return session;
  }

  _setFinalSummary(sessionId, summary) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    session.final_summary = summary;
    session.status = 'completed';
    session.updated_at = new Date().toISOString();
    return session;
  }

  setFinalSummary(sessionId, summary) {
    return this._setFinalSummary(sessionId, summary);
  }

  // Get serializable state for client
  getSerializableState(sessionId) {
    const session = this.getSession(sessionId);
    return JSON.parse(JSON.stringify(session));
  }

  // Clean up old sessions (optional, for memory management)
  cleanup(maxAgeMs = 3600000) { // 1 hour default
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      const sessionAge = now - new Date(session.updated_at).getTime();
      if (sessionAge > maxAgeMs) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

export default new StateManager();
