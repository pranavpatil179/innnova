// API service for communicating with the backend
const API_BASE_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '');

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function createSession() {
  const response = await fetch(buildUrl('/api/sessions'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}

export async function sendInstruction(instruction, sessionId) {
  const response = await fetch(buildUrl('/api/instruction'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instruction, sessionId }),
  });
  return response.json();
}

export async function answerClarification(sessionId, answer) {
  const response = await fetch(buildUrl('/api/clarification'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, answer }),
  });
  return response.json();
}

export async function getSessionState(sessionId) {
  const response = await fetch(buildUrl(`/api/sessions/${sessionId}`));
  return response.json();
}

export async function checkHealth() {
  const response = await fetch(buildUrl('/health'));
  return response.json();
}
