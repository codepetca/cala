import { describe, it, expect } from 'vitest';
import {
  msToSlot,
  slotToMs,
  snap,
  msToPosition,
  positionToMs,
  durationToHeight,
  getHourLines,
  timeRangesOverlap,
  getCurrentTimePosition,
  formatTime,
  formatDate,
  HOUR_HEIGHT,
  DEFAULT_SNAP_MINUTES,
  FINE_SNAP_MINUTES,
  START_HOUR,
  END_HOUR,
} from '../../app/(plan)/[planId]/timeMath';

describe('timeMath utilities', () => {
  describe('msToSlot and slotToMs', () => {
    it('should convert 9:00 AM to slot 2', () => {
      const date = new Date('2025-01-13T09:00:00');
      const slot = msToSlot(date.getTime());
      expect(slot).toBe(2); // (9 - 8) * 2 = 2
    });

    it('should convert 9:30 AM to slot 3', () => {
      const date = new Date('2025-01-13T09:30:00');
      const slot = msToSlot(date.getTime());
      expect(slot).toBe(3); // (9 - 8) * 2 + 1 = 3
    });

    it('should convert slot back to milliseconds', () => {
      const baseDate = new Date('2025-01-13T00:00:00');
      const slot = 4; // 10:00 AM
      const ms = slotToMs(slot, baseDate);
      const resultDate = new Date(ms);
      
      expect(resultDate.getHours()).toBe(10);
      expect(resultDate.getMinutes()).toBe(0);
    });

    it('should be reversible', () => {
      const originalDate = new Date('2025-01-13T14:30:00');
      const baseDate = new Date('2025-01-13T00:00:00');
      
      const slot = msToSlot(originalDate.getTime());
      const ms = slotToMs(slot, baseDate);
      const resultDate = new Date(ms);
      
      expect(resultDate.getHours()).toBe(originalDate.getHours());
      expect(resultDate.getMinutes()).toBe(originalDate.getMinutes());
    });
  });

  describe('snap', () => {
    it('should snap to 30-minute intervals by default', () => {
      const date = new Date('2025-01-13T09:17:00'); // 9:17 AM
      const snapped = snap(date.getTime());
      const result = new Date(snapped);
      
      expect(result.getMinutes()).toBe(30); // Should snap to 9:30
    });

    it('should snap to 5-minute intervals with alt key', () => {
      const date = new Date('2025-01-13T09:17:00'); // 9:17 AM  
      const snapped = snap(date.getTime(), true);
      const result = new Date(snapped);
      
      expect(result.getMinutes()).toBe(15); // Should snap to 9:15
    });

    it('should snap 9:07 to 9:00 with fine snapping', () => {
      const date = new Date('2025-01-13T09:07:00');
      const snapped = snap(date.getTime(), true);
      const result = new Date(snapped);
      
      expect(result.getMinutes()).toBe(5); // Should snap to 9:05
    });
  });

  describe('msToPosition and positionToMs', () => {
    it('should convert 9:00 AM to correct pixel position', () => {
      const date = new Date('2025-01-13T09:00:00');
      const position = msToPosition(date.getTime());
      
      expect(position).toBe(HOUR_HEIGHT); // 1 hour after START_HOUR (8 AM)
    });

    it('should convert 8:30 AM to half-hour position', () => {
      const date = new Date('2025-01-13T08:30:00');
      const position = msToPosition(date.getTime());
      
      expect(position).toBe(HOUR_HEIGHT / 2); // 30 minutes after START_HOUR
    });

    it('should handle times outside business hours', () => {
      const earlyDate = new Date('2025-01-13T06:00:00');
      const lateDate = new Date('2025-01-13T22:00:00');
      
      expect(msToPosition(earlyDate.getTime())).toBe(0);
      expect(msToPosition(lateDate.getTime())).toBe((END_HOUR - START_HOUR) * HOUR_HEIGHT);
    });

    it('should be reversible within business hours', () => {
      const originalDate = new Date('2025-01-13T14:30:00');
      const baseDate = new Date('2025-01-13T00:00:00');
      
      const position = msToPosition(originalDate.getTime());
      const ms = positionToMs(position, baseDate);
      const resultDate = new Date(ms);
      
      expect(resultDate.getHours()).toBe(originalDate.getHours());
      expect(resultDate.getMinutes()).toBe(originalDate.getMinutes());
    });
  });

  describe('durationToHeight', () => {
    it('should convert 1 hour to HOUR_HEIGHT pixels', () => {
      const oneHour = 60 * 60 * 1000; // 1 hour in ms
      const height = durationToHeight(oneHour);
      
      expect(height).toBe(HOUR_HEIGHT);
    });

    it('should convert 30 minutes to half HOUR_HEIGHT', () => {
      const thirtyMinutes = 30 * 60 * 1000;
      const height = durationToHeight(thirtyMinutes);
      
      expect(height).toBe(HOUR_HEIGHT / 2);
    });

    it('should handle 2.5 hour duration', () => {
      const twoHourThirty = 2.5 * 60 * 60 * 1000;
      const height = durationToHeight(twoHourThirty);
      
      expect(height).toBe(HOUR_HEIGHT * 2.5);
    });
  });

  describe('getHourLines', () => {
    it('should generate correct number of hour lines', () => {
      const lines = getHourLines();
      
      expect(lines).toHaveLength(END_HOUR - START_HOUR + 1); // 8 AM to 8 PM inclusive
    });

    it('should have correct labels and positions', () => {
      const lines = getHourLines();
      
      const firstLine = lines[0]; // 8 AM
      expect(firstLine.hour).toBe(8);
      expect(firstLine.label).toBe('8 AM');
      expect(firstLine.position).toBe(0);
      
      const lastLine = lines[lines.length - 1]; // 8 PM (20:00)
      expect(lastLine.hour).toBe(20);
      expect(lastLine.label).toBe('8 PM');
      expect(lastLine.position).toBe((20 - 8) * HOUR_HEIGHT);
    });

    it('should handle 12 PM correctly', () => {
      const lines = getHourLines();
      const noonLine = lines.find(line => line.hour === 12);
      
      expect(noonLine?.label).toBe('12 PM');
    });
  });

  describe('timeRangesOverlap', () => {
    it('should detect overlapping ranges', () => {
      const start1 = new Date('2025-01-13T09:00:00').getTime();
      const end1 = new Date('2025-01-13T11:00:00').getTime();
      const start2 = new Date('2025-01-13T10:00:00').getTime();
      const end2 = new Date('2025-01-13T12:00:00').getTime();
      
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(true);
    });

    it('should detect non-overlapping ranges', () => {
      const start1 = new Date('2025-01-13T09:00:00').getTime();
      const end1 = new Date('2025-01-13T10:00:00').getTime();
      const start2 = new Date('2025-01-13T11:00:00').getTime();
      const end2 = new Date('2025-01-13T12:00:00').getTime();
      
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(false);
    });

    it('should handle adjacent ranges (no overlap)', () => {
      const start1 = new Date('2025-01-13T09:00:00').getTime();
      const end1 = new Date('2025-01-13T10:00:00').getTime();
      const start2 = new Date('2025-01-13T10:00:00').getTime();
      const end2 = new Date('2025-01-13T11:00:00').getTime();
      
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(false);
    });

    it('should handle contained ranges', () => {
      const start1 = new Date('2025-01-13T09:00:00').getTime();
      const end1 = new Date('2025-01-13T12:00:00').getTime();
      const start2 = new Date('2025-01-13T10:00:00').getTime();
      const end2 = new Date('2025-01-13T11:00:00').getTime();
      
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(true);
    });
  });

  describe('formatTime', () => {
    it('should format morning time correctly', () => {
      const date = new Date('2025-01-13T09:30:00').getTime();
      const formatted = formatTime(date);
      
      expect(formatted).toBe('9:30 AM');
    });

    it('should format afternoon time correctly', () => {
      const date = new Date('2025-01-13T15:45:00').getTime();
      const formatted = formatTime(date);
      
      expect(formatted).toBe('3:45 PM');
    });

    it('should format noon correctly', () => {
      const date = new Date('2025-01-13T12:00:00').getTime();
      const formatted = formatTime(date);
      
      expect(formatted).toBe('12:00 PM');
    });

    it('should format midnight correctly', () => {
      const date = new Date('2025-01-13T00:00:00').getTime();
      const formatted = formatTime(date);
      
      expect(formatted).toBe('12:00 AM');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-13T09:00:00').getTime(); // Monday
      const formatted = formatDate(date);
      
      expect(formatted).toBe('Mon, Jan 13');
    });

    it('should format different day correctly', () => {
      const date = new Date('2025-01-15T09:00:00').getTime(); // Wednesday
      const formatted = formatDate(date);
      
      expect(formatted).toBe('Wed, Jan 15');
    });
  });

  describe('getCurrentTimePosition', () => {
    it('should return null for times outside business hours', () => {
      // Mock current time to 6 AM (before business hours)
      const originalDate = Date;
      global.Date = class extends Date {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super('2025-01-13T06:00:00'); // 6 AM
          } else {
            super(...args);
          }
        }
        static now() {
          return new Date('2025-01-13T06:00:00').getTime();
        }
      } as any;

      expect(getCurrentTimePosition()).toBeNull();

      // Restore original Date
      global.Date = originalDate;
    });

    it('should return position for times within business hours', () => {
      // Mock current time to 9 AM (within business hours)
      const originalDate = Date;
      global.Date = class extends Date {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super('2025-01-13T09:00:00'); // 9 AM
          } else {
            super(...args);
          }
        }
        static now() {
          return new Date('2025-01-13T09:00:00').getTime();
        }
        getHours() {
          return 9;
        }
      } as any;

      const position = getCurrentTimePosition();
      expect(position).toBe(HOUR_HEIGHT); // 1 hour after start (8 AM)

      // Restore original Date
      global.Date = originalDate;
    });
  });
});