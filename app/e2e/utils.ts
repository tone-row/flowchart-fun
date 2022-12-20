import { Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import crypto from "crypto";
import Stripe from "stripe";

const rapidAPIKey = process.env.RAPID_API_KEY;
if (!rapidAPIKey) throw new Error("RAPID_API_KEY not set");

const stripeKey = process.env.STRIPE_KEY_TEST_ENV;
if (!stripeKey) throw new Error("STRIPE_KEY_TEST_ENV not set");

// SUPABASE_TEST_URL
const supabaseTestUrl = process.env.SUPABASE_TEST_URL;
if (!supabaseTestUrl) throw new Error("SUPABASE_TEST_URL not set");

// SUPABASE_TEST_ANON_KEY
const supabaseTestAnonKey = process.env.SUPABASE_TEST_ANON_KEY;
if (!supabaseTestAnonKey) throw new Error("SUPABASE_TEST_ANON_KEY not set");

const stripe = new Stripe(stripeKey, {
  apiVersion: "2020-08-27",
});

const _supabase = createClient(supabaseTestUrl, supabaseTestAnonKey);

export const BASE_URL = process.env.E2E_START_URL ?? "http://localhost:3000";
const EMAIL_DOMAINS_LIST: string[] = [];

export async function goToPath(page: Page, path = "") {
  await page.goto(`${BASE_URL}/${path}`);
}

export async function goToTab(page: Page, tabName: string) {
  // find the element in the header that contains the tab name and click it
  await page.click(`text=${tabName}`);
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

export async function deleteCustomerByEmail(email: string) {
  const customers = await stripe.customers.list({
    email,
  });
  for (const customer of customers.data) {
    await stripe.customers.del(customer.id);
  }
}

export async function changeEditorText(page: Page, text: string) {
  const monacoEditor = page.locator(".monaco-editor").nth(0);
  await monacoEditor.click();
  await page.keyboard.press("Meta+KeyA");
  await page.keyboard.type(text);
}
