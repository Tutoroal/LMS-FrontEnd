import { test, expect, type Page } from "@playwright/test";

const password = "E2e-password-123";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", route => {
    const url = new URL(route.request().url());
    return route.continue({ url: "http://localhost:18080" + url.pathname + url.search });
  });
});

async function login(page: Page, account: "superadmin" | "admin") {
  await page.goto("/login");
  await page.getByLabel("Identitas akun").fill(account + "@e2e.invalid");
  await page.getByLabel("Kata sandi", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
}

test("super admin manages operational admins and global settings", async ({ page, request }) => {
  await login(page, "superadmin");
  await expect(page).toHaveURL(/\/dashboard\/super-admin$/);
  await expect(page.getByText("Portal Super Admin", { exact: true })).toBeVisible();

  await page.goto("/dashboard/users/admin");
  await expect(page.getByRole("heading", { name: "Manajemen Administrator" })).toBeVisible();
  await page.getByRole("button", { name: "Tambah akun", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nama lengkap").fill("Admin Browser Baru");
  await dialog.getByLabel("Email").fill("admin.browser.baru@e2e.invalid");
  await dialog.getByLabel("Kata sandi (minimal 8 karakter)").fill(password);
  await dialog.getByRole("button", { name: "Simpan akun" }).click();
  await expect(page.getByText("Admin Browser Baru", { exact: true })).toBeVisible();

  await page.goto("/dashboard/settings");
  await page.getByLabel("Nama sekolah").fill("SMK Browser Super Admin");
  await page.getByRole("button", { name: "Simpan pengaturan" }).click();
  await expect(page.getByText("Pengaturan sekolah tersimpan.", { exact: true })).toBeVisible();

  await page.goto("/dashboard/academic/classes");
  await expect(page).toHaveURL(/\/dashboard\/super-admin$/);
  const token = await page.evaluate(() => localStorage.getItem("token"));
  const denied = await request.post("http://localhost:18080/api/admin/classes", { headers: { Authorization: "Bearer " + token }, data: { name: "Terlarang", major: "PPLG" } });
  expect(denied.status()).toBe(403);
});

test("admin cannot manage admins or global settings", async ({ page, request }) => {
  await login(page, "admin");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/users/admin");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/settings");
  await expect(page).toHaveURL(/\/dashboard$/);
  const token = await page.evaluate(() => localStorage.getItem("token"));
  const denied = await request.put("http://localhost:18080/api/admin/settings", { headers: { Authorization: "Bearer " + token }, data: { school_name: "Tidak boleh", academic_year: "2026/2027" } });
  expect(denied.status()).toBe(403);
});