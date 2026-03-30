/**
 * Minimal in-process "DB" for MVP demos.
 * Swap this module for Redis/Postgres later; callers only need async get/save.
 */
const byId = new Map();

export async function saveAnalysis(record) {
  byId.set(record.id, { ...record, savedAt: new Date().toISOString() });
  return record;
}

export async function getAnalysis(id) {
  return byId.get(id) ?? null;
}
