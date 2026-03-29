// Using Jest globals (describe, it, expect) as configured in the project
import { calculateNewPosition } from '../lib/orderUtils';

describe('Card Reorder Logic (Trello-like Floating Point)', () => {
  it('should assign a default position of 65535 to the first item', () => {
    expect(calculateNewPosition()).toBe(65535);
  });

  it('should split the difference when moving to the top (pos/2)', () => {
    const nextPos = 1000;
    expect(calculateNewPosition(null, nextPos)).toBe(500);
  });

  it('should add the default increment when moving to the bottom (pos + 65535)', () => {
    const lastPos = 5000;
    expect(calculateNewPosition(lastPos, null)).toBe(5000 + 65535);
  });

  it('should precisely midpoint between two cards', () => {
    const prevPos = 100;
    const nextPos = 200;
    expect(calculateNewPosition(prevPos, nextPos)).toBe(150);
  });

  it('should handle decimal positions correctly', () => {
    const prevPos = 10.5;
    const nextPos = 10.6;
    expect(calculateNewPosition(prevPos, nextPos)).toBe(10.55);
  });
});
