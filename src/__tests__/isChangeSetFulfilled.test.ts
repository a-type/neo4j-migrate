import { areSetsEqual } from '../isChangeSetFulfilled';

describe('isChangeSetFulfilled', () => {
  describe('areSetsEqual helper', () => {
    test('handles empty sets', () => {
      expect(areSetsEqual([], [])).toBe(true);
      expect(areSetsEqual([], ['foo'])).toBe(false);
      expect(areSetsEqual(['foo'], [])).toBe(false);
    });

    test('handles single item sets', () => {
      expect(areSetsEqual(['foo'], ['foo'])).toBe(true);
      expect(areSetsEqual(['foo'], ['bar'])).toBe(false);
    });

    test('handles multi item sets with different order', () => {
      expect(areSetsEqual(['foo', 'bar'], ['bar', 'foo'])).toBe(true);
    });
  });
});
