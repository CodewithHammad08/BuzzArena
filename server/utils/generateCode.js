/**
 * Room code generator.
 * Produces a 6-character alphanumeric code (uppercase, no ambiguous chars).
 */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes O, 0, I, 1

/**
 * Generate a unique 6-character room code.
 * @returns {string}
 */
function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

module.exports = { generateRoomCode };
