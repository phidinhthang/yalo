import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

const baseUrl = 'http://localhost:3000';
let username: string;
let password: string;

test.beforeAll(() => {
  username = faker.internet.userName();
  password = faker.internet.password();
});

test.describe('Auth', () => {
  test('register and logout', async ({ page }) => {
    await page.goto(`${baseUrl}/register`);
    await page
      .locator('[data-testid="username-input"]')
      .type(username, { delay: 100 });
    await page
      .locator('[data-testid="password-input"]')
      .type(password, { delay: 100 });
    await page.locator('[data-testid="register-btn"]').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(`${baseUrl}`);

    let localStorage = await page.evaluate(() => window.localStorage);
    let token = localStorage['token'];
    let refreshToken = localStorage['refresh-token'];
    expect(token).not.toHaveLength(0);
    expect(refreshToken).not.toHaveLength(0);
    await new Promise((res) => setTimeout(res, 1000));
    await page.locator('[data-testid="avatar-menu"]').click();

    await page.locator('[data-testid="logout"]').click();
    await page.locator('[data-testid="modal-confirm"]').click();
    await new Promise((res) => setTimeout(res, 3000));
    localStorage = await page.evaluate(() => window.localStorage);
    token = localStorage['token'];
    refreshToken = localStorage['refresh-token'];
    expect(token).toHaveLength(0);
    expect(refreshToken).toHaveLength(0);
    await new Promise((res) => setTimeout(res, 1000));
  });

  test('login and delete account', async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
    await page
      .locator('[data-testid="username-input"]')
      .type(username, { delay: 100 });
    await page
      .locator('[data-testid="password-input"]')
      .type(password, { delay: 100 });
    await page.locator('[data-testid="login-btn"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(`${baseUrl}`);

    let localStorage = await page.evaluate(() => window.localStorage);
    let token = localStorage['token'];
    let refreshToken = localStorage['refresh-token'];
    expect(token).not.toHaveLength(0);
    expect(refreshToken).not.toHaveLength(0);
    await new Promise((res) => setTimeout(res, 1000));
    await page.locator('[data-testid="avatar-menu"]').click();

    await page.locator('[data-testid="delete-account"]').click();
    await new Promise((res) => setTimeout(res, 3000));
    localStorage = await page.evaluate(() => window.localStorage);
    token = localStorage['token'];
    refreshToken = localStorage['refresh-token'];
    expect(token).toHaveLength(0);
    expect(refreshToken).toHaveLength(0);
    await new Promise((res) => setTimeout(res, 1000));
  });
});
