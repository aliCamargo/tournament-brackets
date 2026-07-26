export function formatRounds(rounds) {
  return JSON.stringify(rounds, null, 2);
}

export function parseRoundsJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { ok: false, error: `Invalid JSON: ${err.message}` };
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { ok: false, error: 'Rounds must be a non-empty array' };
  }
  return { ok: true, rounds: parsed };
}
