import { test, expect } from '@playwright/test';

test.describe('Theme functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load with system theme preference', async ({ page }) => {
    // Check that html element has theme class applied
    const html = page.locator('html');
    const classList = await html.getAttribute('class');
    expect(classList).toContain('light'); // or 'dark' depending on system preference
  });

  test('should switch to light theme', async ({ page }) => {
    // Find and click the theme toggle button
    await page.click('[data-testid="theme-toggle"]');
    
    // Click on light theme option
    await page.click('text="Light"');
    
    // Verify html element has light class
    await expect(page.locator('html')).toHaveClass(/light/);
    
    // Verify background color changes
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => getComputedStyle(el).backgroundColor);
    
    // Light theme should have light background
    expect(bgColor).toMatch(/rgb\(255, 255, 255\)|rgb\(250, 250, 250\)/);
  });

  test('should switch to dark theme', async ({ page }) => {
    // Find and click the theme toggle button
    await page.click('[data-testid="theme-toggle"]');
    
    // Click on dark theme option
    await page.click('text="Dark"');
    
    // Verify html element has dark class
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Verify background color changes
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => getComputedStyle(el).backgroundColor);
    
    // Dark theme should have dark background
    expect(bgColor).toMatch(/rgb\(10, 10, 10\)|rgb\(9, 9, 11\)/);
  });

  test('should persist theme selection', async ({ page }) => {
    // Switch to dark theme
    await page.click('[data-testid="theme-toggle"]');
    await page.click('text="Dark"');
    
    // Reload page
    await page.reload();
    
    // Verify theme is still dark
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should have proper meta theme-color tags', async ({ page }) => {
    // Check for light theme meta tag
    const lightMeta = page.locator('meta[name="theme-color"][media="(prefers-color-scheme: light)"]');
    await expect(lightMeta).toHaveAttribute('content', '#ffffff');
    
    // Check for dark theme meta tag
    const darkMeta = page.locator('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]');
    await expect(darkMeta).toHaveAttribute('content', '#0a0a0a');
  });

  test('should apply theme tokens to components', async ({ page }) => {
    // Test that components use theme tokens instead of hardcoded colors
    const card = page.locator('.card').first();
    
    if (await card.isVisible()) {
      // Switch to light theme
      await page.click('[data-testid="theme-toggle"]');
      await page.click('text="Light"');
      
      const lightCardBg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
      
      // Switch to dark theme
      await page.click('[data-testid="theme-toggle"]');
      await page.click('text="Dark"');
      
      const darkCardBg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
      
      // Background should be different between themes
      expect(lightCardBg).not.toBe(darkCardBg);
    }
  });

  test('should handle system theme preference', async ({ page }) => {
    // Click theme toggle
    await page.click('[data-testid="theme-toggle"]');
    
    // Click system option
    await page.click('text="System"');
    
    // Verify localStorage is cleared (system preference)
    const themeValue = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeValue).toBeNull();
  });
});