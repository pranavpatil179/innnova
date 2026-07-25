// Tool library for the autonomous assistant agent
// Each tool has a ~20% random failure/timeout rate
// Tools auto-retry (max 2 retries) with brief backoff

import { mockFlights, mockHotels, mockRestaurants, mockCalendar, mockBookings } from './mockData.js';

// Helper: simulate random failure (~20% chance)
function shouldFail() {
  return Math.random() < 0.20;
}

// Helper: simulate network delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: execute a tool with retry logic (max 2 retries, brief backoff)
async function executeWithRetry(toolFn, toolName, args, state) {
  const maxRetries = 2;
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Log the attempt
      state.logAction({
        type: 'tool_call',
        tool: toolName,
        args: args,
        attempt: attempt + 1,
        timestamp: new Date().toISOString(),
        status: 'calling'
      });

      // Simulate network delay
      await delay(300 + Math.random() * 500);

      // Simulate random failure
      if (shouldFail()) {
        throw new Error(`Simulated ${toolName} timeout/failure`);
      }

      const result = await toolFn(args, state);

      state.logAction({
        type: 'tool_result',
        tool: toolName,
        args: args,
        attempt: attempt + 1,
        timestamp: new Date().toISOString(),
        status: 'success',
        result: result
      });

      return result;
    } catch (error) {
      lastError = error;
      state.logAction({
        type: 'tool_error',
        tool: toolName,
        args: args,
        attempt: attempt + 1,
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message
      });

      if (attempt < maxRetries) {
        // Brief backoff before retry
        const backoffMs = 500 * (attempt + 1);
        state.logAction({
          type: 'retry',
          tool: toolName,
          timestamp: new Date().toISOString(),
          message: `Retrying in ${backoffMs}ms... (attempt ${attempt + 2}/${maxRetries + 1})`
        });
        await delay(backoffMs);
      }
    }
  }

  // All retries exhausted - degrade gracefully
  state.logAction({
    type: 'tool_failed',
    tool: toolName,
    args: args,
    timestamp: new Date().toISOString(),
    message: `${toolName} failed after ${maxRetries + 1} attempts. ${lastError.message}`
  });

  return {
    success: false,
    error: lastError.message,
    data: null
  };
}

// Tool: search_flights
async function searchFlightsImpl(args, state) {
  const { from, to, date } = args;

  // Filter flights by route and date
  let results = mockFlights.filter(f =>
    f.from === from && f.to === to
  );

  // If no date match, still return flights (date is approximate)
  if (results.length === 0) {
    // Try case-insensitive city matching
    results = mockFlights.filter(f =>
      f.from.toLowerCase() === from.toLowerCase() &&
      f.to.toLowerCase() === to.toLowerCase()
    );
  }

  // Sort by price ascending
  results.sort((a, b) => a.price - b.price);

  return {
    success: true,
    data: results,
    count: results.length,
    source: 'simulated'
  };
}

// Tool: search_hotels
async function searchHotelsImpl(args, state) {
  const { city, check_in, check_out } = args;

  let results = mockHotels.filter(h =>
    h.city.toLowerCase() === city.toLowerCase()
  );

  // Sort by price ascending
  results.sort((a, b) => a.price_per_night - b.price_per_night);

  return {
    success: true,
    data: results,
    count: results.length,
    source: 'simulated'
  };
}

// Tool: book_flight
async function bookFlightImpl(args, state) {
  const { flight_id } = args;

  const flight = mockFlights.find(f => f.id === flight_id);

  if (!flight) {
    return {
      success: false,
      error: `Flight ${flight_id} not found`,
      data: null
    };
  }

  const booking = {
    id: `BK-FLIGHT-${Date.now()}`,
    flight_id: flight.id,
    airline: flight.airline,
    from: flight.from,
    to: flight.to,
    departure: flight.departure,
    arrival: flight.arrival,
    price: flight.price,
    class: flight.class,
    status: 'confirmed',
    booking_time: new Date().toISOString(),
    source: 'simulated'
  };

  mockBookings.flights.push(booking);

  return {
    success: true,
    data: booking,
    source: 'simulated'
  };
}

// Tool: book_hotel
async function bookHotelImpl(args, state) {
  const { hotel_id, check_in, check_out } = args;

  const hotel = mockHotels.find(h => h.id === hotel_id);

  if (!hotel) {
    return {
      success: false,
      error: `Hotel ${hotel_id} not found`,
      data: null
    };
  }

  const nights = 1; // Default 1 night
  const total_price = hotel.price_per_night * nights;

  const booking = {
    id: `BK-HOTEL-${Date.now()}`,
    hotel_id: hotel.id,
    name: hotel.name,
    city: hotel.city,
    address: hotel.address,
    check_in: check_in || hotel.check_in,
    check_out: check_out || hotel.check_out,
    price_per_night: hotel.price_per_night,
    total_price: total_price,
    rating: hotel.rating,
    stars: hotel.stars,
    amenities: hotel.amenities,
    status: 'confirmed',
    booking_time: new Date().toISOString(),
    source: 'simulated'
  };

  mockBookings.hotels.push(booking);

  return {
    success: true,
    data: booking,
    source: 'simulated'
  };
}

// Tool: search_restaurants
async function searchRestaurantsImpl(args, state) {
  const { cuisine, date, party_size } = args;

  let results = mockRestaurants.filter(r =>
    r.cuisine.toLowerCase() === cuisine.toLowerCase()
  );

  // Sort by rating descending
  results.sort((a, b) => b.rating - a.rating);

  return {
    success: true,
    data: results,
    count: results.length,
    source: 'simulated'
  };
}

// Tool: book_restaurant
async function bookRestaurantImpl(args, state) {
  const { restaurant_id, date, time, party_size } = args;

  const restaurant = mockRestaurants.find(r => r.id === restaurant_id);

  if (!restaurant) {
    return {
      success: false,
      error: `Restaurant ${restaurant_id} not found`,
      data: null
    };
  }

  const booking = {
    id: `BK-REST-${Date.now()}`,
    restaurant_id: restaurant.id,
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    address: restaurant.address,
    date: date,
    time: time,
    party_size: party_size,
    status: 'confirmed',
    booking_time: new Date().toISOString(),
    source: 'simulated'
  };

  mockBookings.restaurants.push(booking);

  return {
    success: true,
    data: booking,
    source: 'simulated'
  };
}

// Tool: check_calendar
async function checkCalendarImpl(args, state) {
  const { date } = args;

  const events = mockCalendar[date] || [];

  return {
    success: true,
    data: events,
    count: events.length,
    source: 'simulated'
  };
}

// Tool: add_calendar_event
async function addCalendarEventImpl(args, state) {
  const { title, date, time, description } = args;

  const event = {
    id: `CAL-${Date.now()}`,
    title: title,
    date: date,
    time: time,
    description: description || '',
    created_at: new Date().toISOString(),
    source: 'simulated'
  };

  if (!mockCalendar[date]) {
    mockCalendar[date] = [];
  }
  mockCalendar[date].push(event);

  return {
    success: true,
    data: event,
    source: 'simulated'
  };
}

// Export tool registry
export const toolRegistry = {
  search_flights: {
    fn: searchFlightsImpl,
    description: "Search for flights by route and date",
    params: ["from", "to", "date"]
  },
  search_hotels: {
    fn: searchHotelsImpl,
    description: "Search for hotels by city and dates",
    params: ["city", "check_in", "check_out"]
  },
  book_flight: {
    fn: bookFlightImpl,
    description: "Book a specific flight by ID",
    params: ["flight_id"]
  },
  book_hotel: {
    fn: bookHotelImpl,
    description: "Book a specific hotel by ID",
    params: ["hotel_id", "check_in", "check_out"]
  },
  search_restaurants: {
    fn: searchRestaurantsImpl,
    description: "Search for restaurants by cuisine and date",
    params: ["cuisine", "date", "party_size"]
  },
  book_restaurant: {
    fn: bookRestaurantImpl,
    description: "Book a restaurant table",
    params: ["restaurant_id", "date", "time", "party_size"]
  },
  check_calendar: {
    fn: checkCalendarImpl,
    description: "Check calendar availability for a date",
    params: ["date"]
  },
  add_calendar_event: {
    fn: addCalendarEventImpl,
    description: "Add an event to the calendar",
    params: ["title", "date", "time", "description"]
  }
};

// Main tool executor
export async function executeTool(toolName, args, state) {
  const tool = toolRegistry[toolName];

  if (!tool) {
    return {
      success: false,
      error: `Unknown tool: ${toolName}`,
      data: null
    };
  }

  return await executeWithRetry(tool.fn, toolName, args, state);
}
