import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
const { executeSubtask } = await import('./server.js');

test('executeSubtask books a flight using the selected flight from prior state', async () => {
  const state = {
    selectedFlight: { id: 'FL-002', price: 4800 },
    selectedHotel: null,
    selectedRestaurant: null,
    selectedSlot: null,
    bookings: { flights: [], hotels: [], restaurants: [], calendar: [] },
    lastSearchResults: {},
    logAction() {},
    setFinalSummary() {}
  };

  const result = await executeSubtask(
    { id: 5, description: 'Book the selected flight', tool: 'book_flight', args: {} },
    { budget: 40000, check_in: '2026-07-25' },
    state
  );

  assert.equal(result.success, true);
  assert.equal(result.data.flight_id, 'FL-002');
  assert.equal(state.bookings.flights.length, 1);
});
