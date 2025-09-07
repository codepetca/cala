import { test, expect } from '@playwright/test';

test('basic navigation and page loads', async ({ page }) => {
  await page.goto('/');
  
  await expect(page.locator('h1')).toContainText('Trip Planner');
  await expect(page.locator('h2')).toContainText('Your Workspaces');
});

test('public share page loads without auth', async ({ page }) => {
  await page.goto('/share/demo-japan-2026');
  
  await expect(page.locator('h1')).toContainText('Japan 2026');
  await expect(page.locator('text=Public')).toBeVisible();
  await expect(page.locator('text=This is a read-only view')).toBeVisible();
});

test('sign in flow and workspace creation', async ({ page }) => {
  await page.goto('/');
  
  const emailInput = page.locator('input[type="email"]');
  const signInButton = page.locator('button:has-text("Sign In")');
  
  await emailInput.fill('playwright@test.com');
  await signInButton.click();
  
  await page.waitForTimeout(2000);
  
  await expect(page.locator('text=Welcome')).toBeVisible();
});

test('create trip flow', async ({ page }) => {
  await page.goto('/');
  
  const emailInput = page.locator('input[type="email"]');
  const signInButton = page.locator('button:has-text("Sign In")');
  
  await emailInput.fill('playwright@test.com');
  await signInButton.click();
  
  await page.waitForTimeout(2000);
  
  const workspaceLink = page.locator('a').first();
  if (await workspaceLink.isVisible()) {
    await workspaceLink.click();
    
    const tripNameInput = page.locator('input[placeholder*="Trip name"]');
    const createButton = page.locator('button:has-text("Create Trip")');
    
    await tripNameInput.fill('E2E Test Trip');
    await createButton.click();
    
    await expect(page.locator('text=E2E Test Trip')).toBeVisible();
  }
});

test('add unscheduled event flow', async ({ page }) => {
  await page.goto('/');
  
  const emailInput = page.locator('input[type="email"]');
  const signInButton = page.locator('button:has-text("Sign In")');
  
  await emailInput.fill('playwright@test.com');
  await signInButton.click();
  
  await page.waitForTimeout(2000);
  
  const workspaceLink = page.locator('a').first();
  if (await workspaceLink.isVisible()) {
    await workspaceLink.click();
    
    const openTripButton = page.locator('a:has-text("Open Trip")').first();
    if (await openTripButton.isVisible()) {
      await openTripButton.click();
      
      const addEventButton = page.locator('button:has-text("Add Event")');
      await addEventButton.click();
      
      const titleInput = page.locator('input[id="title"]');
      const notesTextarea = page.locator('textarea[id="notes"]');
      const saveButton = page.locator('button:has-text("Save Event")');
      
      await titleInput.fill('E2E Test Event');
      await notesTextarea.fill('This is a test event created by Playwright');
      await saveButton.click();
      
      await expect(page.locator('text=E2E Test Event')).toBeVisible();
      await expect(page.locator('text=This is a test event created by Playwright')).toBeVisible();
      
      await expect(page.locator('h2:has-text("Unscheduled")')).toBeVisible();
    }
  }
});

test('schedule event as all-day', async ({ page }) => {
  await page.goto('/');
  
  const emailInput = page.locator('input[type="email"]');
  const signInButton = page.locator('button:has-text("Sign In")');
  
  await emailInput.fill('playwright@test.com');
  await signInButton.click();
  
  await page.waitForTimeout(2000);
  
  const workspaceLink = page.locator('a').first();
  if (await workspaceLink.isVisible()) {
    await workspaceLink.click();
    
    const openTripButton = page.locator('a:has-text("Open Trip")').first();
    if (await openTripButton.isVisible()) {
      await openTripButton.click();
      
      const editButton = page.locator('button[title="Edit"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        
        const kindSelect = page.locator('select[id="kind"]');
        const startDateInput = page.locator('input[id="startDate"]');
        const endDateInput = page.locator('input[id="endDate"]');
        const saveButton = page.locator('button:has-text("Save Event")');
        
        await kindSelect.selectOption('allDay');
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const dayAfterStr = dayAfter.toISOString().split('T')[0];
        
        await startDateInput.fill(tomorrowStr);
        await endDateInput.fill(dayAfterStr);
        await saveButton.click();
        
        await expect(page.locator('h2:has-text("Scheduled Events")')).toBeVisible();
      }
    }
  }
});

test('make trip public and verify share link', async ({ page }) => {
  await page.goto('/');
  
  const emailInput = page.locator('input[type="email"]');
  const signInButton = page.locator('button:has-text("Sign In")');
  
  await emailInput.fill('playwright@test.com');
  await signInButton.click();
  
  await page.waitForTimeout(2000);
  
  const workspaceLink = page.locator('a').first();
  if (await workspaceLink.isVisible()) {
    await workspaceLink.click();
    
    const openTripButton = page.locator('a:has-text("Open Trip")').first();
    if (await openTripButton.isVisible()) {
      await openTripButton.click();
      
      const makePublicButton = page.locator('button:has-text("Make Public")');
      if (await makePublicButton.isVisible()) {
        await makePublicButton.click();
        
        await expect(page.locator('button:has-text("Make Private")')).toBeVisible();
        await expect(page.locator('a:has-text("View public link")')).toBeVisible();
        
        const publicLink = page.locator('a:has-text("View public link")');
        const href = await publicLink.getAttribute('href');
        
        if (href) {
          const newPage = await page.context().newPage();
          await newPage.goto(href);
          
          await expect(newPage.locator('text=Public')).toBeVisible();
          await expect(newPage.locator('text=This is a read-only view')).toBeVisible();
          
          await newPage.close();
        }
      }
    }
  }
});