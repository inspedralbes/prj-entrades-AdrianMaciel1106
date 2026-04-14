/**
 * event.model.js
 * ──────────────
 * In-memory storage for events.
 * Fields: id, nom, data, lloc
 */

const events = new Map();

/**
 * @typedef {Object} Event
 * @property {string} id        - Unique ID
 * @property {string} nom       - Name of the movie
 * @property {string} data      - Release date
 * @property {string} lloc      - Cinema room
 * @property {string} imatge    - Poster URL
 * @property {string} backdrop  - Backdrop URL
 * @property {string} sinopsi   - Plot overview
 * @property {number} rating    - Movie score
 */

/**
 * Add or update an event (movie).
 */
function createEvent(id, nom, data, lloc, imatge, backdrop = '', sinopsi = '', rating = 0) {
  const event = { id, nom, data, lloc, imatge, backdrop, sinopsi, rating };
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

function deleteEvent(id) {
  return events.delete(id);
}

export {
  createEvent,
  getAllEvents,
  deleteEvent
};
