import { Page } from "@playwright/test";
import axios from "axios";
import crypto from "crypto";

export const BASE_URL = process.env.E2E_START_URL ?? "http://localhost:3000";
const EMAIL_DOMAINS_LIST: string[] = [];

export async function goToPath(page: Page, path = "") {
  await page.goto(`${BASE_URL}/${path}`);
}

export async function goToTab(page: Page, tabName: string) {
  await page.click(`button:has-text("${tabName}")`);
}

/** Generates a temp email address */
export async function getTempEmail() {
  if (!process.env.RAPID_API_KEY) throw new Error("Missing API Key");

  if (EMAIL_DOMAINS_LIST.length === 0) {
    const response = await axios({
      method: "GET",
      url: "https://privatix-temp-mail-v1.p.rapidapi.com/request/domains/",
      headers: {
        "X-RapidAPI-Host": "privatix-temp-mail-v1.p.rapidapi.com",
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      },
    });
    EMAIL_DOMAINS_LIST.push(...response.data);
  }

  const randomDomain =
    EMAIL_DOMAINS_LIST[Math.floor(Math.random() * EMAIL_DOMAINS_LIST.length)];
  const randomEmail = `ci+${Date.now()}${randomDomain}`;
  return randomEmail;
}

/** Returns inbox messages for a given email */
export async function getTempEmailMessage(email: string) {
  if (!process.env.RAPID_API_KEY) throw new Error("Missing API Key");
  const hash = crypto.createHash("md5").update(email).digest("hex");
  const response = await axios.request({
    method: "GET",
    url: `https://privatix-temp-mail-v1.p.rapidapi.com/request/mail/id/${hash}/`,
    headers: {
      "X-RapidAPI-Host": "privatix-temp-mail-v1.p.rapidapi.com",
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
    },
  });
  const emails = response.data;
  return emails;
}
