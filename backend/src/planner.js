// Planner module for the autonomous assistant agent
// This is a rule-based planning engine that mimics LLM behavior
// It parses natural language instructions, extracts parameters,
// generates ordered subtask plans, and makes decisions based on tool results

// City code mapping
const cityCodes = {
  'delhi': 'DEL',
  'del': 'DEL',
  'mumbai': 'BOM',
  'bombay': 'BOM',
  'bom': 'BOM',
  'bangalore': 'BLR',
  'bangaluru': 'BLR',
  'blr': 'BLR',
  'chennai': 'MAA',
  'kolkata': 'CCU',
  'calcutta': 'CCU',
  'ccu': 'CCU',
  'hyderabad': 'HYD',
  'pune': 'PNQ',
  'ahmedabad': 'AMD',
  'jaipur': 'JAI',
  'goa': 'GOI',
  'goi': 'GOI'
};

const cityNames = {
  'DEL': 'Delhi',
  'BOM': 'Mumbai',
  'BLR': 'Bangalore',
  'MAA': 'Chennai',
  'CCU': 'Kolkata',
  'HYD': 'Hyderabad',
  'PNQ': 'Pune',
  'AMD': 'Ahmedabad',
  'JAI': 'Jaipur',
  'GOI': 'Goa'
};

// Parse instruction and extract parameters
export function parseInstruction(instruction) {
  const lower = instruction.toLowerCase().trim();
  const params = {
    raw: instruction,
    type: null,
    from: null,
    to: null,
    city: null,
    budget: null,
    budget_currency: '₹',
    date: null,
    check_in: null,
    check_out: null,
    party_size: null,
    cuisine: null,
    time: null,
    day: null
  };

  // Detect instruction type
  const isTripBooking = lower.includes('flight') && lower.includes('hotel') ||
                        lower.includes('flight') && lower.includes('book') ||
                        (lower.includes('flight') && lower.includes('cheapest'));

  const isDiningCalendar = lower.includes('restaurant') && lower.includes('calendar') ||
                           lower.includes('table') && lower.includes('calendar') ||
                           lower.includes('italian') && lower.includes('calendar');

  // More flexible detection
  if (lower.includes('flight') || lower.includes('hotel') || lower.includes('trip') || lower.includes('travel')) {
    params.type = 'trip_booking';
  } else if (lower.includes('restaurant') || lower.includes('table') || lower.includes('dining') || lower.includes('italian')) {
    params.type = 'dining_calendar';
  } else {
    params.type = 'unknown';
  }

  // Extract budget (₹ or rupees or INR)
  const budgetMatch = instruction.match(/₹\s*([\d,]+)/) ||
                      instruction.match(/rupees?\s*([\d,]+)/i) ||
                      instruction.match(/inr\s*([\d,]+)/i);
  if (budgetMatch) {
    params.budget = parseInt(budgetMatch[1].replace(/,/g, ''));
  }

  // Extract party size
  const partyMatch = instruction.match(/table for (\d+)/i) ||
                     instruction.match(/party of (\d+)/i) ||
                     instruction.match(/for (\d+) people/i);
  if (partyMatch) {
    params.party_size = parseInt(partyMatch[1]);
  }

  // Extract date references
  if (lower.includes('next weekend') || lower.includes('weekend')) {
    params.date = '2026-07-25';
    params.check_in = '2026-07-25';
    params.check_out = '2026-07-26';
    params.day = 'Saturday';
  } else if (lower.includes('this saturday') || lower.includes('saturday')) {
    params.date = '2026-07-25';
    params.day = 'Saturday';
    params.check_in = '2026-07-25';
    params.check_out = '2026-07-26';
  } else if (lower.includes('this sunday') || lower.includes('sunday')) {
    params.date = '2026-07-26';
    params.day = 'Sunday';
    params.check_in = '2026-07-26';
    params.check_out = '2026-07-27';
  } else if (lower.includes('tomorrow')) {
    params.date = '2026-07-26';
    params.day = 'Tomorrow';
  }

  // Extract time (evening, afternoon, etc.)
  if (lower.includes('evening')) {
    params.time = '19:30';
  } else if (lower.includes('afternoon')) {
    params.time = '14:00';
  } else if (lower.includes('night')) {
    params.time = '20:30';
  }

  // Extract cuisine
  if (lower.includes('italian')) {
    params.cuisine = 'Italian';
  } else if (lower.includes('mexican')) {
    params.cuisine = 'Mexican';
  } else if (lower.includes('indian')) {
    params.cuisine = 'Indian';
  } else if (lower.includes('chinese')) {
    params.cuisine = 'Chinese';
  }

  // Extract "highly-rated" preference
  params.highly_rated = lower.includes('highly-rated') || lower.includes('highly rated') || lower.includes('best');

  // Extract "cheapest" preference
  params.cheapest = lower.includes('cheapest') || lower.includes('lowest price');

  // Extract city/destination for trip booking
  // Look for patterns like "for [city]" or "to [city]"
  const forCityMatch = instruction.match(/for\s+(\w+)\s*(?:next|this|weekend|under|$)/i);
  if (forCityMatch) {
    const cityName = forCityMatch[1].toLowerCase();
    if (cityCodes[cityName]) {
      params.to = cityCodes[cityName];
      params.city = cityNames[cityCodes[cityName]];
    }
  }

  // Also check "to [city]" pattern
  const toCityMatch = instruction.match(/\bto\s+(\w+)\b/i);
  if (toCityMatch && !params.to) {
    const cityName = toCityMatch[1].toLowerCase();
    if (cityCodes[cityName]) {
      params.to = cityCodes[cityName];
      params.city = cityNames[cityCodes[cityName]];
    }
  }

  // Default origin is Delhi
  params.from = 'DEL';

  return params;
}

// Check for missing required parameters
export function checkMissingParams(params) {
  const missing = [];

  if (params.type === 'trip_booking') {
    if (!params.to) missing.push('destination city');
    if (!params.budget) missing.push('budget');
    if (!params.check_in) missing.push('travel date');
  } else if (params.type === 'dining_calendar') {
    if (!params.party_size) missing.push('party size');
    if (!params.date) missing.push('date');
    if (!params.cuisine) missing.push('cuisine type');
  }

  return missing;
}

// Generate a single clarifying question for the first missing parameter
export function generateClarificationQuestion(missingParams, params) {
  if (missingParams.length === 0) return null;

  const firstMissing = missingParams[0];
  let question = '';

  switch (firstMissing) {
    case 'destination city':
      question = `What city would you like to travel to? (e.g., Mumbai, Bangalore, Kolkata)`;
      break;
    case 'budget':
      question = `What is your budget for this trip? (e.g., ₹40,000)`;
      break;
    case 'travel date':
      question = `When would you like to travel? (e.g., next weekend, this Saturday)`;
      break;
    case 'party size':
      question = `How many people is this for?`;
      break;
    case 'date':
      question = `What date would you like to dine? (e.g., this Saturday)`;
      break;
    case 'cuisine type':
      question = `What type of cuisine would you like? (e.g., Italian, Mexican, Indian)`;
      break;
    default:
      question = `Could you clarify: what ${firstMissing} did you have in mind?`;
  }

  return question;
}

// Generate ordered subtask plan
export function generatePlan(params) {
  const subtasks = [];

  if (params.type === 'trip_booking') {
    // Step 1: Search for flights
    subtasks.push({
      id: 1,
      description: `Search for flights from ${params.from} to ${params.to} on ${params.check_in}`,
      tool: 'search_flights',
      args: {
        from: params.from,
        to: params.to,
        date: params.check_in
      },
      reasoning: `Looking for available flights to ${params.city} for the requested date.`
    });

    // Step 2: Search for hotels
    subtasks.push({
      id: 2,
      description: `Search for hotels in ${params.city} for ${params.check_in} to ${params.check_out}`,
      tool: 'search_hotels',
      args: {
        city: params.city,
        check_in: params.check_in,
        check_out: params.check_out
      },
      reasoning: `Looking for available hotels in ${params.city} within the budget.`
    });

    // Step 3: Select cheapest flight
    subtasks.push({
      id: 3,
      description: 'Select the cheapest flight option',
      tool: 'select_flight',
      args: {},
      reasoning: `Selecting the cheapest flight that fits within the budget of ₹${params.budget.toLocaleString()}.`
    });

    // Step 4: Select cheapest hotel
    subtasks.push({
      id: 4,
      description: 'Select the cheapest hotel option',
      tool: 'select_hotel',
      args: {},
      reasoning: `Selecting the cheapest hotel that fits within the remaining budget.`
    });

    // Step 5: Book flight
    subtasks.push({
      id: 5,
      description: 'Book the selected flight',
      tool: 'book_flight',
      args: {},
      reasoning: `Confirming the flight booking for the selected option.`
    });

    // Step 6: Book hotel
    subtasks.push({
      id: 6,
      description: 'Book the selected hotel',
      tool: 'book_hotel',
      args: {},
      reasoning: `Confirming the hotel booking for the selected option.`
    });

    // Step 7: Generate summary
    subtasks.push({
      id: 7,
      description: 'Generate final summary',
      tool: 'generate_summary',
      args: {},
      reasoning: `Compiling the final booking summary with total cost vs budget.`
    });

  } else if (params.type === 'dining_calendar') {
    // Step 1: Search for restaurants
    subtasks.push({
      id: 1,
      description: `Search for ${params.cuisine} restaurants for ${params.party_size} people on ${params.day}`,
      tool: 'search_restaurants',
      args: {
        cuisine: params.cuisine,
        date: params.date,
        party_size: params.party_size
      },
      reasoning: `Looking for highly-rated ${params.cuisine} restaurants available for ${params.party_size} people on ${params.day}.`
    });

    // Step 2: Check calendar
    subtasks.push({
      id: 2,
      description: `Check calendar availability for ${params.date}`,
      tool: 'check_calendar',
      args: {
        date: params.date
      },
      reasoning: `Checking existing calendar events to avoid conflicts on ${params.date}.`
    });

    // Step 3: Select best restaurant
    subtasks.push({
      id: 3,
      description: 'Select the best-rated restaurant',
      tool: 'select_restaurant',
      args: {},
      reasoning: `Selecting the highest-rated restaurant with available slots at the requested time.`
    });

    // Step 4: Book restaurant
    subtasks.push({
      id: 4,
      description: 'Book the selected restaurant',
      tool: 'book_restaurant',
      args: {},
      reasoning: `Confirming the restaurant reservation for ${params.party_size} people at ${params.time}.`
    });

    // Step 5: Add to calendar
    subtasks.push({
      id: 5,
      description: 'Add the reservation to calendar',
      tool: 'add_calendar_event',
      args: {},
      reasoning: `Adding the restaurant booking to the calendar to remember the reservation.`
    });

    // Step 6: Generate summary
    subtasks.push({
      id: 6,
      description: 'Generate final summary',
      tool: 'generate_summary',
      args: {},
      reasoning: `Compiling the final booking summary with reservation details.`
    });
  }

  return subtasks;
}

// Decision logic for selecting options
export function selectBestFlight(flights, budget) {
  if (!flights || flights.length === 0) return null;

  // Filter by budget if provided
  let candidates = flights;
  if (budget) {
    candidates = flights.filter(f => f.price <= budget);
    if (candidates.length === 0) {
      candidates = flights; // If none fit, take all
    }
  }

  // Sort by price ascending (cheapest first)
  candidates.sort((a, b) => a.price - b.price);

  return {
    selected: candidates[0],
    reasoning: `Selected ${candidates[0].airline} flight — ₹${candidates[0].price.toLocaleString()}, the cheapest option among ${candidates.length} results.`,
    alternatives: candidates.slice(1, 3).map(f => ({
      id: f.id,
      airline: f.airline,
      price: f.price,
      departure: f.departure
    }))
  };
}

export function selectBestHotel(hotels, budget, flightCost = 0) {
  if (!hotels || hotels.length === 0) return null;

  const remainingBudget = budget ? budget - flightCost : null;

  // Filter by remaining budget if provided
  let candidates = hotels;
  if (remainingBudget) {
    candidates = hotels.filter(h => h.price_per_night <= remainingBudget);
    if (candidates.length === 0) {
      candidates = hotels;
    }
  }

  // Sort by price ascending (cheapest first)
  candidates.sort((a, b) => a.price_per_night - b.price_per_night);

  return {
    selected: candidates[0],
    reasoning: `Selected ${candidates[0].name} — ₹${candidates[0].price_per_night.toLocaleString()}/night, the cheapest ${candidates[0].stars}★ hotel among ${candidates.length} results.`,
    alternatives: candidates.slice(1, 3).map(h => ({
      id: h.id,
      name: h.name,
      price: h.price_per_night,
      rating: h.rating
    }))
  };
}

export function selectBestRestaurant(restaurants, time, partySize) {
  if (!restaurants || restaurants.length === 0) return null;

  // Filter by available slots matching the requested time
  let candidates = restaurants.filter(r => {
    if (!time) return true;
    // Check if any slot is within 1 hour of requested time
    const requestedHour = parseInt(time.split(':')[0]);
    return r.available_slots.some(slot => {
      const slotHour = parseInt(slot.split(':')[0]);
      return Math.abs(slotHour - requestedHour) <= 1;
    });
  });

  if (candidates.length === 0) {
    candidates = restaurants;
  }

  // Sort by rating descending (highest rated first)
  candidates.sort((a, b) => b.rating - a.rating);

  const selected = candidates[0];
  const slot = selected.available_slots.find(s => {
    if (!time) return s === selected.available_slots[0];
    const slotHour = parseInt(s.split(':')[0]);
    const reqHour = parseInt(time.split(':')[0]);
    return Math.abs(slotHour - reqHour) <= 1;
  }) || selected.available_slots[0];

  return {
    selected: selected,
    selected_slot: slot,
    reasoning: `Selected ${selected.name} — rated ${selected.rating}★ with ${selected.available_slots.length} available slots, the highest-rated option among ${candidates.length} results.`,
    alternatives: candidates.slice(1, 3).map(r => ({
      id: r.id,
      name: r.name,
      rating: r.rating
    }))
  };
}

// Generate final summary
export function generateFinalSummary(params, state) {
  let summary = {
    type: params.type,
    instruction: params.raw,
    bookings: {
      flights: state.bookings.flights,
      hotels: state.bookings.hotels,
      restaurants: state.bookings.restaurants,
      calendar: state.bookings.calendar
    },
    total_cost: 0,
    budget: params.budget || null,
    within_budget: true,
    reasoning: ''
  };

  let totalCost = 0;

  if (params.type === 'trip_booking') {
    const flight = state.bookings.flights[0];
    const hotel = state.bookings.hotels[0];

    if (flight) {
      totalCost += flight.price;
    }
    if (hotel) {
      totalCost += hotel.total_price;
    }

    summary.total_cost = totalCost;
    summary.within_budget = params.budget ? totalCost <= params.budget : true;

    summary.reasoning = `I searched for flights and hotels to ${params.city} for ${params.check_in}, then selected the cheapest options that fit within your budget of ₹${params.budget ? params.budget.toLocaleString() : 'N/A'}. The total cost came to ₹${totalCost.toLocaleString()}, which ${summary.within_budget ? 'is within' : 'exceeds'} your budget.`;

    summary.details = {
      flight: flight ? {
        airline: flight.airline,
        from: flight.from,
        to: flight.to,
        departure: flight.departure,
        arrival: flight.arrival,
        price: flight.price
      } : null,
      hotel: hotel ? {
        name: hotel.name,
        city: hotel.city,
        check_in: hotel.check_in,
        check_out: hotel.check_out,
        price: hotel.total_price,
        rating: hotel.rating,
        stars: hotel.stars
      } : null
    };

  } else if (params.type === 'dining_calendar') {
    const restaurant = state.bookings.restaurants[0];
    const calendarEvent = state.bookings.calendar[0];

    summary.total_cost = 0; // No cost for dining reservation in this simulation
    summary.within_budget = true;

    summary.reasoning = `I searched for highly-rated ${params.cuisine} restaurants for ${params.party_size} people on ${params.day}, checked your calendar for conflicts, then booked a table at ${restaurant ? restaurant.name : 'a restaurant'} at ${params.time}. The reservation has also been added to your calendar.`;

    summary.details = {
      restaurant: restaurant ? {
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        address: restaurant.address,
        date: restaurant.date,
        time: restaurant.time,
        party_size: restaurant.party_size,
        rating: restaurant.rating
      } : null,
      calendar_event: calendarEvent ? {
        title: calendarEvent.title,
        date: calendarEvent.date,
        time: calendarEvent.time,
        description: calendarEvent.description
      } : null
    };
  }

  return summary;
}
