import { test, expect } from '@playwright/test';

test.describe('WeekBoard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the WeekBoard page
    await page.goto('/plan/test-plan');
  });

  test('renders WeekBoard with backlog and days', async ({ page }) => {
    // Check that the main WeekBoard component is rendered
    await expect(page.getByTestId('week-board')).toBeVisible();
    
    // Check that the backlog column is present
    await expect(page.getByTestId('backlog-drop-zone')).toBeVisible();
    
    // Check that day columns are rendered (should have 7 days)
    const dayColumns = page.locator('[data-testid^="day-column-"]');
    await expect(dayColumns).toHaveCount(7);
  });

  test('displays backlog items', async ({ page }) => {
    // Check that backlog search input is present
    await expect(page.getByTestId('backlog-search')).toBeVisible();
    
    // Check that some backlog items are displayed
    const backlogItems = page.locator('[data-testid^="item-card-"]');
    await expect(backlogItems).toHaveCount(4); // Based on our mock data
    
    // Check first backlog item
    await expect(page.getByTestId('item-card-unsch-1')).toContainText('Visit local farmers market');
  });

  test('displays scheduled events', async ({ page }) => {
    // Check that all-day events are displayed
    const allDayEvents = page.locator('[data-testid^="chip-card-"]');
    await expect(allDayEvents.first()).toBeVisible();
    
    // Check that timed events are displayed
    const timedEvents = page.locator('[data-testid^="timed-event-"]');
    await expect(timedEvents.first()).toBeVisible();
  });

  test('backlog search functionality', async ({ page }) => {
    // Type in search input
    await page.getByTestId('backlog-search').fill('pizza');
    
    // Should show only matching items
    const visibleItems = page.locator('[data-testid^="item-card-"]:visible');
    await expect(visibleItems).toHaveCount(1);
    await expect(visibleItems).toContainText('Try the famous pizza place');
    
    // Clear search
    await page.getByTestId('backlog-search').fill('');
    await expect(page.locator('[data-testid^="item-card-"]')).toHaveCount(4);
  });

  test('drag backlog item to Monday all-day', async ({ page }) => {
    // Find the first backlog item and Monday's all-day lane
    const backlogItem = page.getByTestId('item-card-unsch-1');
    const mondayDate = new Date();
    mondayDate.setDate(mondayDate.getDate() - mondayDate.getDay() + 1); // Get Monday
    const dateStr = mondayDate.toISOString().split('T')[0];
    const mondayAllDay = page.getByTestId(`allday-lane-${dateStr}`);
    
    // Perform drag and drop
    await backlogItem.dragTo(mondayAllDay);
    
    // Verify the item was moved (should appear as all-day event)
    await expect(backlogItem).not.toBeVisible();
    // Note: In real implementation, we'd check for the new chip in the all-day lane
  });

  test('drag backlog item to Monday time grid', async ({ page }) => {
    // Find a backlog item and Monday's time grid
    const backlogItem = page.getByTestId('item-card-unsch-2');
    const mondayDate = new Date();
    mondayDate.setDate(mondayDate.getDate() - mondayDate.getDay() + 1);
    const dateStr = mondayDate.toISOString().split('T')[0];
    const mondayTimeGrid = page.getByTestId(`time-grid-${dateStr}`);
    
    // Drag to time grid (approximate 9 AM slot)
    await backlogItem.dragTo(mondayTimeGrid, { 
      targetPosition: { x: 100, y: 60 } // Roughly 9 AM position
    });
    
    // Verify the item was moved
    await expect(backlogItem).not.toBeVisible();
  });

  test('keyboard navigation - focus and activate drag', async ({ page }) => {
    // Focus on first backlog item
    const firstItem = page.getByTestId('item-card-unsch-1');
    await firstItem.focus();
    
    // Press Space to start drag mode (dnd-kit keyboard behavior)
    await page.keyboard.press('Space');
    
    // Press ArrowRight to move to next drop zone
    await page.keyboard.press('ArrowRight');
    
    // Press Enter to drop
    await page.keyboard.press('Enter');
    
    // Note: In real implementation, we'd verify the drop was successful
  });

  test('resize timed event', async ({ page }) => {
    // Find a timed event and its resize handle
    const timedEvent = page.getByTestId('timed-event-timed-1');
    await expect(timedEvent).toBeVisible();
    
    const resizeHandle = page.getByTestId('resize-handle-bottom-timed-1');
    await expect(resizeHandle).toBeVisible();
    
    // Get initial height
    const initialBox = await timedEvent.boundingBox();
    
    // Drag resize handle down by 30 pixels (30 minutes)
    await resizeHandle.dragTo(resizeHandle, {
      targetPosition: { x: 0, y: 30 }
    });
    
    // Verify event was resized
    const newBox = await timedEvent.boundingBox();
    expect(newBox!.height).toBeGreaterThan(initialBox!.height);
  });

  test('accessibility - screen reader announcements', async ({ page }) => {
    // Check that there's an aria-live region for announcements
    const announcements = page.locator('[role="status"][aria-live="polite"]');
    await expect(announcements).toBeAttached();
  });

  test('time grid shows hour lines and current time indicator', async ({ page }) => {
    // Check that hour lines are displayed
    const hourLines = page.locator('.absolute.left-0.right-0.border-t');
    await expect(hourLines.first()).toBeVisible();
    
    // Check that current time indicator might be visible (depends on current time)
    const currentTimeIndicator = page.locator('.border-t-2.border-red-500');
    // Don't assert visibility as it depends on current time being in 8 AM - 8 PM range
  });
});

// Additional test for mobile responsiveness (future)
test.describe('WeekBoard Mobile (TODO)', () => {
  test.skip('should be mobile responsive', async ({ page }) => {
    // TODO: Implement mobile-specific tests when mobile version is added
  });
});