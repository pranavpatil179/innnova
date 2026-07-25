// Mock data fixtures for the autonomous assistant agent
// All data is simulated and clearly labeled as such in the UI

export const mockFlights = [
  {
    id: "FL-001",
    airline: "Air India",
    from: "DEL",
    to: "BOM",
    departure: "2026-07-25T06:30:00+05:30",
    arrival: "2026-07-25T08:45:00+05:30",
    price: 5200,
    duration: "2h 15m",
    stops: 0,
    rating: 4.2,
    class: "Economy"
  },
  {
    id: "FL-002",
    airline: "IndiGo",
    from: "DEL",
    to: "BOM",
    departure: "2026-07-25T07:15:00+05:30",
    arrival: "2026-07-25T09:30:00+05:30",
    price: 4800,
    duration: "2h 15m",
    stops: 0,
    rating: 4.5,
    class: "Economy"
  },
  {
    id: "FL-003",
    airline: "Vistara",
    from: "DEL",
    to: "BOM",
    departure: "2026-07-25T12:00:00+05:30",
    arrival: "2026-07-25T14:15:00+05:30",
    price: 7500,
    duration: "2h 15m",
    stops: 0,
    rating: 4.7,
    class: "Economy"
  },
  {
    id: "FL-004",
    airline: "Air India",
    from: "DEL",
    to: "BOM",
    departure: "2026-07-25T19:30:00+05:30",
    arrival: "2026-07-26T21:45:00+05:30",
    price: 6200,
    duration: "2h 15m",
    stops: 0,
    rating: 4.2,
    class: "Economy"
  },
  {
    id: "FL-005",
    airline: "IndiGo",
    from: "DEL",
    to: "BLR",
    departure: "2026-07-25T05:00:00+05:30",
    arrival: "2026-07-25T07:30:00+05:30",
    price: 8500,
    duration: "2h 30m",
    stops: 0,
    rating: 4.5,
    class: "Economy"
  },
  {
    id: "FL-006",
    airline: "Vistara",
    from: "DEL",
    to: "BLR",
    departure: "2026-07-25T08:00:00+05:30",
    arrival: "2026-07-25T10:30:00+05:30",
    price: 9200,
    duration: "2h 30m",
    stops: 0,
    rating: 4.7,
    class: "Economy"
  },
  {
    id: "FL-007",
    airline: "AirAsia",
    from: "DEL",
    to: "BLR",
    departure: "2026-07-25T14:00:00+05:30",
    arrival: "2026-07-25T16:30:00+05:30",
    price: 6800,
    duration: "2h 30m",
    stops: 0,
    rating: 4.0,
    class: "Economy"
  },
  {
    id: "FL-008",
    airline: "IndiGo",
    from: "DEL",
    to: "BLR",
    departure: "2026-07-25T20:00:00+05:30",
    arrival: "2026-07-25T22:30:00+05:30",
    price: 7800,
    duration: "2h 30m",
    stops: 0,
    rating: 4.5,
    class: "Economy"
  },
  {
    id: "FL-009",
    airline: "Air India",
    from: "DEL",
    to: "CCU",
    departure: "2026-07-25T06:00:00+05:30",
    arrival: "2026-07-25T08:30:00+05:30",
    price: 9500,
    duration: "2h 30m",
    stops: 0,
    rating: 4.2,
    class: "Economy"
  },
  {
    id: "FL-010",
    airline: "IndiGo",
    from: "DEL",
    to: "CCU",
    departure: "2026-07-25T10:00:00+05:30",
    arrival: "2026-07-25T12:30:00+05:30",
    price: 8200,
    duration: "2h 30m",
    stops: 0,
    rating: 4.5,
    class: "Economy"
  }
];

export const mockHotels = [
  {
    id: "HT-001",
    name: "Trident Hotel",
    city: "Mumbai",
    address: "Nariman Point, Mumbai",
    price_per_night: 8500,
    rating: 4.5,
    stars: 5,
    amenities: ["WiFi", "Pool", "Spa", "Gym"],
    check_in: "2026-07-25",
    check_out: "2026-07-26"
  },
  {
    id: "HT-002",
    name: "Novotel Mumbai",
    city: "Mumbai",
    address: "Andheri East, Mumbai",
    price_per_night: 7200,
    rating: 4.3,
    stars: 4,
    amenities: ["WiFi", "Pool", "Gym"],
    check_in: "2026-07-25",
    check_out: "2026-07-26"
  },
  {
    id: "HT-003",
    name: "Hotel Sahara Star",
    city: "Mumbai",
    address: "Sahar, Mumbai",
    price_per_night: 6800,
    rating: 4.1,
    stars: 4,
    amenities: ["WiFi", "Pool"],
    check_in: "2026-07-25",
    check_out: "2026-07-26"
  },
  {
    id: "HT-004",
    name: "Oberoi Mumbai",
    city: "Mumbai",
    address: "Marine Drive, Mumbai",
    price_per_night: 12000,
    rating: 4.8,
    stars: 5,
    amenities: ["WiFi", "Pool", "Spa", "Gym", "Beach Access"],
    check_in: "2026-07-25",
    check_out: "2026-07-26"
  },
  {
    id: "HT-005",
    name: "ITC Gardenia",
    city: "Bangalore",
    address: "Residency Road, Bangalore",
    price_per_night: 9500,
    rating: 4.6,
    stars: 5,
    amenities: ["WiFi", "Pool", "Spa", "Gym"],
    check_in: "2026-07-25",
    check_out: "2026-07-26"
  },
  {
    id: "HT-006",
    name: "Novotel Bangalore",
    city: "Bangalore",
    address: "Rajajinagar, Bangalore",
    price_per_night: 7800,
    rating: 4.2,
    stars: 4,
    amenities: ["WiFi", "Pool", "Gym"],
    check_in: "2026-07-25",
    check_out: "2026-07-26"
  },
  {
    id: "HT-007",
    name: "Treebo Trend",
    city: "Bangalore",
    address: "MG Road, Bangalore",
    price_per_night: 4200,
    rating: 3.8,
    stars: 3,
    amenities: ["WiFi"],
    check_in: "2026-07-25",
    check_out: "2026-07-26"
  },
  {
    id: "HT-008",
    name: "The Lalit Bangalore",
    city: "Bangalore",
    address: "Residency Road, Bangalore",
    price_per_night: 11000,
    rating: 4.5,
    stars: 5,
    amenities: ["WiFi", "Pool", "Spa", "Gym"],
    check_in: "2026-07-25",
    check_out: "2026-07-26"
  },
  {
    id: "HT-009",
    name: "Taj Bengal",
    city: "Kolkata",
    address: "EM Bypass, Kolkata",
    price_per_night: 10500,
    rating: 4.7,
    stars: 5,
    amenities: ["WiFi", "Pool", "Spa", "Gym"],
    check_in: "2026-07-25",
    check_out: "2026-07-26"
  },
  {
    id: "HT-010",
    name: "Hotel Hindusthan",
    city: "Kolkata",
    address: "Park Street, Kolkata",
    price_per_night: 5500,
    rating: 4.0,
    stars: 4,
    amenities: ["WiFi", "Pool"],
    check_in: "2026-07-25",
    check_out: "2026-07-26"
  }
];

export const mockRestaurants = [
  {
    id: "RT-001",
    name: "Pasta Bowl",
    cuisine: "Italian",
    address: "Khan Market, Delhi",
    rating: 4.5,
    price_range: "₹1,500-2,500",
    available_slots: ["18:00", "19:30", "20:00", "21:00"],
    phone: "+91-11-2336-6666"
  },
  {
    id: "RT-002",
    name: "Diva Speziale",
    cuisine: "Italian",
    address: "Hauz Khas, Delhi",
    rating: 4.6,
    price_range: "₹2,000-3,500",
    available_slots: ["18:30", "19:00", "20:30", "21:30"],
    phone: "+91-11-4601-1111"
  },
  {
    id: "RT-003",
    name: "La Piazza",
    cuisine: "Italian",
    address: "Connaught Place, Delhi",
    rating: 4.3,
    price_range: "₹1,800-3,000",
    available_slots: ["18:00", "19:00", "20:00", "21:00"],
    phone: "+91-11-2331-1111"
  },
  {
    id: "RT-004",
    name: "Don Giovanni",
    cuisine: "Italian",
    address: "Greater Kailash, Delhi",
    rating: 4.4,
    price_range: "₹2,200-3,800",
    available_slots: ["18:30", "19:30", "20:30"],
    phone: "+91-11-4602-2222"
  },
  {
    id: "RT-005",
    name: "Bella Ciao",
    cuisine: "Italian",
    address: "Lodhi Road, Delhi",
    rating: 4.2,
    price_range: "₹1,200-2,200",
    available_slots: ["18:00", "19:00", "20:00", "21:30"],
    phone: "+91-11-2430-1111"
  },
  {
    id: "RT-006",
    name: "Mamma Mia",
    cuisine: "Italian",
    address: "CP, Delhi",
    rating: 3.9,
    price_range: "₹1,000-2,000",
    available_slots: ["18:00", "19:30", "21:00"],
    phone: "+91-11-2335-1111"
  },
  {
    id: "RT-007",
    name: "Little Italy",
    cuisine: "Italian",
    address: "Hauz Khas, Delhi",
    rating: 4.1,
    price_range: "₹1,500-2,800",
    available_slots: ["18:30", "20:00", "21:00"],
    phone: "+91-11-4603-3333"
  }
];

export const mockCalendar = {
  "2026-07-25": [
    { id: "CAL-001", title: "Team Meeting", time: "10:00-11:00", description: "Weekly sync" },
    { id: "CAL-002", title: "Doctor Appointment", time: "15:00-16:00", description: "Annual checkup" }
  ],
  "2026-07-26": [
    { id: "CAL-003", title: "Project Review", time: "14:00-15:30", description: "Q3 planning" }
  ],
  "2026-07-24": []
};

export const mockBookings = {
  flights: [],
  hotels: [],
  restaurants: [],
  calendar: []
};
