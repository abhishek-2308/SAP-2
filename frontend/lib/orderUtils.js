/**
 * Pure utility function to calculate a new position (float) for cards or lists.
 * This is the core logic for the Trello reordering system.
 */
export const calculateNewPosition = (prevPos = null, nextPos = null) => {
  const DEFAULT_INCREMENT = 65535;

  // Case 1: First item in the list
  if (prevPos === null && nextPos === null) {
    return DEFAULT_INCREMENT;
  }

  // Case 2: Moving to the very top
  if (prevPos === null) {
    return nextPos / 2;
  }

  // Case 3: Moving to the very bottom
  if (nextPos === null) {
    return prevPos + DEFAULT_INCREMENT;
  }

  // Case 4: Moving between two items
  return (prevPos + nextPos) / 2;
};
