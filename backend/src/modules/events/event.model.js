/**
 * event.model.js
 * ──────────────
 * In-memory storage for events.
 * Fields: id, nom, data, lloc
 */

const events = new Map();

/**
 * @typedef {Object} Event
 * @property {string} id    - Unique ID
 * @property {string} nom   - Name of the event
 * @property {string} data  - Date of the event
 * @property {string} lloc  - Location of the event
 */

/**
 * Add or update an event.
 * @param {string} id
 * @param {string} nom
 * @param {string} data
 * @param {string} lloc
 * @returns {Event}
 */
function createEvent(id, nom, data, lloc) {
  const event = { id, nom, data, lloc };
  events.set(id, event);
  return event;
}

/**
 * Get all events.
 * @returns {Event[]}
 */
function getAllEvents() {
  return Array.from(events.values());
}

module.exports = {
  createEvent,
  getAllEvents,
};
