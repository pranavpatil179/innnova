// Main Express server for the autonomous assistant agent
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import stateManager from './stateManager.js';
import { executeTool } from './tools.js';
import {
  parseInstruction,
  checkMissingParams,
  generateClarificationQuestion,
  generatePlan,
  selectBestFlight,
  selectBestHotel,
  selectBestRestaurant,
  generateFinalSummary
} from './planner.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientBuildPath = path.join(__dirname, '..', '..', 'frontend', 'build');

// Middleware
app.use(cors());
app.use(express.json());

if (fs.existsSync(path.join(clientBuildPath, 'index.html'))) {
  app.use(express.static(clientBuildPath));
}

// Helper: delay for simulation
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: execute a single subtask
export async function executeSubtask(subtask, params, state) {
  const { tool, args, reasoning } = subtask;

  // Log the subtask start
  state.logAction({
    type: 'subtask_start',
    subtask_id: subtask.id,
    description: subtask.description,
    reasoning: reasoning,
    timestamp: new Date().toISOString()
  });

  let result;

  if (tool === 'select_flight') {
    // Decision step: select best flight from search results
    const flightResults = state.lastSearchResults?.flights || [];
    const selection = selectBestFlight(flightResults, params.budget);

    if (selection) {
      state.selectedFlight = selection.selected;
      state.logAction({
        type: 'decision',
        subtask_id: subtask.id,
        tool: 'select_flight',
        reasoning: selection.reasoning,
        selected: selection.selected,
        alternatives: selection.alternatives,
        timestamp: new Date().toISOString()
      });
    } else {
      state.logAction({
        type: 'decision_failed',
        subtask_id: subtask.id,
        tool: 'select_flight',
        message: 'No flights available to select',
        timestamp: new Date().toISOString()
      });
    }

    return selection;

  } else if (tool === 'select_hotel') {
    // Decision step: select best hotel from search results
    const hotelResults = state.lastSearchResults?.hotels || [];
    const flightCost = state.selectedFlight ? state.selectedFlight.price : 0;
    const selection = selectBestHotel(hotelResults, params.budget, flightCost);

    if (selection) {
      state.selectedHotel = selection.selected;
      state.logAction({
        type: 'decision',
        subtask_id: subtask.id,
        tool: 'select_hotel',
        reasoning: selection.reasoning,
        selected: selection.selected,
        alternatives: selection.alternatives,
        timestamp: new Date().toISOString()
      });
    } else {
      state.logAction({
        type: 'decision_failed',
        subtask_id: subtask.id,
        tool: 'select_hotel',
        message: 'No hotels available to select',
        timestamp: new Date().toISOString()
      });
    }

    return selection;

  } else if (tool === 'select_restaurant') {
    // Decision step: select best restaurant from search results
    const restaurantResults = state.lastSearchResults?.restaurants || [];
    const selection = selectBestRestaurant(restaurantResults, params.time, params.party_size);

    if (selection) {
      state.selectedRestaurant = selection.selected;
      state.selectedSlot = selection.selected_slot;
      state.logAction({
        type: 'decision',
        subtask_id: subtask.id,
        tool: 'select_restaurant',
        reasoning: selection.reasoning,
        selected: selection.selected,
        selected_slot: selection.selected_slot,
        alternatives: selection.alternatives,
        timestamp: new Date().toISOString()
      });
    } else {
      state.logAction({
        type: 'decision_failed',
        subtask_id: subtask.id,
        tool: 'select_restaurant',
        message: 'No restaurants available to select',
        timestamp: new Date().toISOString()
      });
    }

    return selection;

  } else if (tool === 'generate_summary') {
    // Generate final summary
    const summary = generateFinalSummary(params, state);
    state.setFinalSummary(summary);

    state.logAction({
      type: 'summary_generated',
      subtask_id: subtask.id,
      summary: summary,
      timestamp: new Date().toISOString()
    });

    return summary;

  } else if (['search_flights', 'search_hotels', 'search_restaurants', 'check_calendar'].includes(tool)) {
    // Search tools - need to store results for later decision steps
    result = await executeTool(tool, args, state);

    if (result.success && result.data) {
      if (!state.lastSearchResults) {
        state.lastSearchResults = {};
      }

      if (tool === 'search_flights') {
        state.lastSearchResults.flights = result.data;
      } else if (tool === 'search_hotels') {
        state.lastSearchResults.hotels = result.data;
      } else if (tool === 'search_restaurants') {
        state.lastSearchResults.restaurants = result.data;
      } else if (tool === 'check_calendar') {
        state.lastSearchResults.calendar = result.data;
      }
    }

    return result;

  } else if (['book_flight', 'book_hotel', 'book_restaurant', 'add_calendar_event'].includes(tool)) {
    // Booking tools - need to use selected items
    let bookingArgs = { ...args };

    if (tool === 'book_flight' && state.selectedFlight) {
      bookingArgs.flight_id = state.selectedFlight.id;
    } else if (tool === 'book_hotel' && state.selectedHotel) {
      bookingArgs.hotel_id = state.selectedHotel.id;
      bookingArgs.check_in = params.check_in;
      bookingArgs.check_out = params.check_out;
    } else if (tool === 'book_restaurant' && state.selectedRestaurant) {
      bookingArgs.restaurant_id = state.selectedRestaurant.id;
      bookingArgs.date = params.date;
      bookingArgs.time = state.selectedSlot || params.time;
      bookingArgs.party_size = params.party_size;
    } else if (tool === 'add_calendar_event' && state.selectedRestaurant) {
      bookingArgs.title = `Dinner at ${state.selectedRestaurant.name}`;
      bookingArgs.date = params.date;
      bookingArgs.time = state.selectedSlot || params.time;
      bookingArgs.description = `${params.party_size} people - ${state.selectedRestaurant.cuisine} restaurant reservation`;
    }

    result = await executeTool(tool, bookingArgs, state);

    if (result.success && result.data) {
      // Store booking in state
      if (tool === 'book_flight') {
        state.bookings.flights.push(result.data);
      } else if (tool === 'book_hotel') {
        state.bookings.hotels.push(result.data);
      } else if (tool === 'book_restaurant') {
        state.bookings.restaurants.push(result.data);
      } else if (tool === 'add_calendar_event') {
        state.bookings.calendar.push(result.data);
      }
    }

    return result;

  } else {
    // Unknown tool
    result = await executeTool(tool, args, state);
    return result;
  }
}

// API Routes

// Create a new session
app.post('/api/sessions', (req, res) => {
  const sessionId = uuidv4();
  const session = stateManager.createSession(sessionId);
  res.json({ sessionId, state: stateManager.getSerializableState(sessionId) });
});

// Get session state
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = stateManager.getSession(sessionId);
  res.json(stateManager.getSerializableState(sessionId));
});

// Process instruction - main entry point
app.post('/api/instruction', async (req, res) => {
  const { instruction, sessionId } = req.body;

  if (!instruction) {
    return res.status(400).json({ error: 'Instruction is required' });
  }

  // Get or create session
  let session = stateManager.getSession(sessionId || uuidv4());
  const sid = session.sessionId;

  // Store original instruction
  session.original_instruction = instruction;
  session.status = 'planning';
  session.updated_at = new Date().toISOString();

  // Log instruction received
  session.logAction({
    type: 'instruction_received',
    instruction: instruction,
    timestamp: new Date().toISOString()
  });

  // Parse instruction
  const params = parseInstruction(instruction);
  session.extracted_parameters = params;
  session.updated_at = new Date().toISOString();

  session.logAction({
    type: 'parameters_extracted',
    parameters: params,
    timestamp: new Date().toISOString()
  });

  // Check for missing parameters
  const missing = checkMissingParams(params);

  if (missing.length > 0) {
    const question = generateClarificationQuestion(missing, params);
    session.status = 'needs_clarification';
    session.clarification_question = question;
    session.updated_at = new Date().toISOString();

    session.logAction({
      type: 'clarification_needed',
      missing_params: missing,
      question: question,
      timestamp: new Date().toISOString()
    });

    return res.json({
      sessionId: sid,
      status: 'needs_clarification',
      clarification_question: question,
      state: stateManager.getSerializableState(sid)
    });
  }

  // Generate plan
  const subtasks = generatePlan(params);
  session.subtasks = subtasks;
  session.status = 'executing';
  session.updated_at = new Date().toISOString();

  session.logAction({
    type: 'plan_generated',
    subtasks: subtasks,
    timestamp: new Date().toISOString()
  });

  // Send initial response with plan
  res.json({
    sessionId: sid,
    status: 'executing',
    plan: subtasks,
    parameters: params,
    state: stateManager.getSerializableState(sid)
  });

  // Start executing subtasks asynchronously
  setImmediate(async () => {
    try {
      for (let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        session.current_step = i + 1;
        session.updated_at = new Date().toISOString();

        await executeSubtask(subtask, params, session);

        // Brief pause between subtasks for UI visibility
        await delay(800);
      }

      session.status = 'completed';
      session.updated_at = new Date().toISOString();

      session.logAction({
        type: 'execution_completed',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      session.status = 'failed';
      session.error = error.message;
      session.updated_at = new Date().toISOString();

      session.logAction({
        type: 'execution_failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Continue with clarification answer
app.post('/api/clarification', async (req, res) => {
  const { sessionId, answer } = req.body;

  if (!sessionId || !answer) {
    return res.status(400).json({ error: 'sessionId and answer are required' });
  }

  const session = stateManager.getSession(sessionId);

  session.logAction({
    type: 'clarification_answered',
    answer: answer,
    timestamp: new Date().toISOString()
  });

  // Re-parse with the answer appended
  const newInstruction = `${session.original_instruction} ${answer}`;
  const params = parseInstruction(newInstruction);
  session.extracted_parameters = params;

  const missing = checkMissingParams(params);

  if (missing.length > 0) {
    const question = generateClarificationQuestion(missing, params);
    session.clarification_question = question;

    session.logAction({
      type: 'clarification_needed',
      missing_params: missing,
      question: question,
      timestamp: new Date().toISOString()
    });

    return res.json({
      sessionId: sessionId,
      status: 'needs_clarification',
      clarification_question: question,
      state: stateManager.getSerializableState(sessionId)
    });
  }

  // Generate plan and start execution
  const subtasks = generatePlan(params);
  session.subtasks = subtasks;
  session.status = 'executing';
  session.clarification_question = null;
  session.updated_at = new Date().toISOString();

  session.logAction({
    type: 'plan_generated',
    subtasks: subtasks,
    timestamp: new Date().toISOString()
  });

  res.json({
    sessionId: sessionId,
    status: 'executing',
    plan: subtasks,
    parameters: params,
    state: stateManager.getSerializableState(sessionId)
  });

  // Start executing
  setImmediate(async () => {
    try {
      for (let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        session.current_step = i + 1;
        session.updated_at = new Date().toISOString();

        await executeSubtask(subtask, params, session);
        await delay(800);
      }

      session.status = 'completed';
      session.updated_at = new Date().toISOString();

      session.logAction({
        type: 'execution_completed',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      session.status = 'failed';
      session.error = error.message;
      session.updated_at = new Date().toISOString();

      session.logAction({
        type: 'execution_failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the React app for unknown GET routes when frontend build exists
if (fs.existsSync(path.join(clientBuildPath, 'index.html'))) {
  app.get('*', (req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'test' && process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`[innnova-assistant] Server running on port ${PORT}`);
  });
}

export { app };
