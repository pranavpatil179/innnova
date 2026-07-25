import React from 'react';

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="mb-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-emerald-500/10 p-2 text-2xl">📊</span>
          <div>
            <h2 className="text-xl font-semibold text-white">Final Summary</h2>
            <p className="text-sm text-slate-400">The agent finished with a concrete recommendation.</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          complete
        </span>
      </div>

      <div className="border-t border-slate-700 pt-4 space-y-4">
        {/* Budget vs Cost */}
        {summary.budget && (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Budget</span>
              <p className="mt-1 text-lg font-semibold text-slate-200">{formatPrice(summary.budget)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Total Cost</span>
              <p className={`mt-1 text-lg font-semibold ${summary.within_budget ? 'text-success' : 'text-danger'}`}>
                {formatPrice(summary.total_cost)}
              </p>
            </div>
          </div>
        )}

        {/* Within Budget Badge */}
        {summary.budget && (
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              summary.within_budget
                ? 'bg-success/20 text-success border border-success/30'
                : 'bg-danger/20 text-danger border border-danger/30'
            }`}>
              {summary.within_budget ? '✓ Within Budget' : '✗ Over Budget'}
            </span>
          </div>
        )}

        {/* Trip Booking Details */}
        {summary.type === 'trip_booking' && summary.details && (
          <div className="space-y-3">
            {summary.details.flight && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                <h4 className="font-semibold text-blue-400 mb-2">✈️ Flight Booking</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">Airline:</span> {summary.details.flight.airline}</div>
                  <div><span className="text-slate-500">Price:</span> {formatPrice(summary.details.flight.price)}</div>
                  <div><span className="text-slate-500">From:</span> {summary.details.flight.from}</div>
                  <div><span className="text-slate-500">To:</span> {summary.details.flight.to}</div>
                  <div><span className="text-slate-500">Departure:</span> {new Date(summary.details.flight.departure).toLocaleString()}</div>
                  <div><span className="text-slate-500">Arrival:</span> {new Date(summary.details.flight.arrival).toLocaleString()}</div>
                </div>
              </div>
            )}

            {summary.details.hotel && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                <h4 className="font-semibold text-green-400 mb-2">🏨 Hotel Booking</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">Name:</span> {summary.details.hotel.name}</div>
                  <div><span className="text-slate-500">City:</span> {summary.details.hotel.city}</div>
                  <div><span className="text-slate-500">Check-in:</span> {summary.details.hotel.check_in}</div>
                  <div><span className="text-slate-500">Check-out:</span> {summary.details.hotel.check_out}</div>
                  <div><span className="text-slate-500">Price:</span> {formatPrice(summary.details.hotel.price)}</div>
                  <div><span className="text-slate-500">Rating:</span> {summary.details.hotel.rating}★ ({summary.details.hotel.stars} stars)</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dining Booking Details */}
        {summary.type === 'dining_calendar' && summary.details && (
          <div className="space-y-3">
            {summary.details.restaurant && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                <h4 className="font-semibold text-pink-400 mb-2">🍝 Restaurant Booking</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">Name:</span> {summary.details.restaurant.name}</div>
                  <div><span className="text-slate-500">Cuisine:</span> {summary.details.restaurant.cuisine}</div>
                  <div><span className="text-slate-500">Address:</span> {summary.details.restaurant.address}</div>
                  <div><span className="text-slate-500">Date:</span> {summary.details.restaurant.date}</div>
                  <div><span className="text-slate-500">Time:</span> {summary.details.restaurant.time}</div>
                  <div><span className="text-slate-500">Party:</span> {summary.details.restaurant.party_size} people</div>
                  <div><span className="text-slate-500">Rating:</span> {summary.details.restaurant.rating}★</div>
                </div>
              </div>
            )}

            {summary.details.calendar_event && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                <h4 className="font-semibold text-purple-400 mb-2">📅 Calendar Event</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">Title:</span> {summary.details.calendar_event.title}</div>
                  <div><span className="text-slate-500">Date:</span> {summary.details.calendar_event.date}</div>
                  <div><span className="text-slate-500">Time:</span> {summary.details.calendar_event.time}</div>
                  <div><span className="text-slate-500">Description:</span> {summary.details.calendar_event.description}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reasoning */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <h4 className="font-semibold text-slate-300 mb-2">Reasoning</h4>
          <p className="text-sm text-slate-300 leading-relaxed">{summary.reasoning}</p>
        </div>

        {/* Simulated Notice */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>⚠️</span>
          <span>All bookings are simulated using mock data. No real transactions were made.</span>
        </div>
      </div>
    </div>
  );
}
