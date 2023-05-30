import dotenv from "dotenv";
import fs from "fs";
import { Configuration, OpenAIApi } from "openai";
import path from "path";
dotenv.config("./env");

// Between Calls To Avoid Rate Limiting
const TIMEOUT = 5000;

/**
 * AUTO TRANSLATIONS
 * =================
 * This script will automatically translate all phrases in messages.po files
 * in the locales folder using OpenAI's API.
 *
 * Call it with pnpm -F app autotranslations
 *
 * You can also run it in debug mode, which will only translate 12 phrases using
 * ```
 * DEBUG=true pnpm -F app autotranslations
 * ```
 *
 * You can also run it for a specific locale using
 * ```
 * LOCALE=de pnpm -F app autotranslations
 * ```
 */

// eslint-disable-next-line no-undef
const apiKey = process.env.OPENAI_SECRET;
if (!apiKey) throw new Error("Missing OPENAI_SECRET");

export const openai = new OpenAIApi(
  new Configuration({
    apiKey,
  })
);

// eslint-disable-next-line no-undef
const DEBUG = process.env.DEBUG === "true";

// eslint-disable-next-line no-undef
const LOCALE = process.env.LOCALE;
if (LOCALE) {
  console.log(`Running in debug mode for locale ${LOCALE}.`);
}

// get all locales
let locales = fs
  .readdirSync("./src/locales/", { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  // filter out "en"
  .filter((dirent) => dirent.name !== "en")
  .map((dirent) => dirent.name);

// IF IN DEBUG MODE WE'LL ONLY RUN ONE LOCALE, LOCALE FROM ENV OR DEFAULT TO DE
if (DEBUG) {
  locales = [LOCALE || "de"];
} else if (LOCALE) {
  locales = [LOCALE];
}

// for each locale folder
for (const locale of locales) {
  // read the messages.po file in this folder
  const messages = fs.readFileSync(
    path.join("./src/locales/", locale, "messages.po"),
    "utf8"
  );

  /**
   * @typedef {{
   *   line: number,
   *   text: string,
   *   translation: string,
   * }} Phrase
   */
  /** @type {Phrase[]} */
  let phrases = [];

  // find the line number that every 'msgstr ""' occurs on
  const lines = messages
    .split("\n")
    .map((line, index) => {
      if (line.includes('msgstr ""')) {
        return index;
      }
    })
    .filter((line) => line !== undefined);

  // throw away the first line number
  lines.shift();

  // for each line number
  for (const line of lines) {
    // read the previous line and extract the string ($) inside of 'msgid "$"'
    const text = messages.split("\n")[line - 1].split('"')[1];

    // store the line number and english text in the object
    phrases.push({
      line,
      text,
      translation: "",
    });
  }

  console.log(`Found ${phrases.length} phrases to translate to ${locale}.`);

  /**
   * IF IN DEBUG MODE WE'LL ONLY RUN MAX 12 PHRASES
   */
  if (DEBUG) {
    console.log(`In debug mode, switching to 12 phrases.`);
    phrases = phrases.slice(0, 12);
  }

  const totalPhrases = phrases.length;

  /** @type {Phrase[]} */
  let finalPhrases = [];

  // while there are still phrases to translate
  while (phrases.length > 0) {
    // pop off the first 6 phrases
    const batch = phrases.splice(0, 6);

    const prompt = `Translate phrases from en to ${locale}\n\nEN\n${batch
      .map((phrase) => `- ${phrase.text}`)
      .join("\n")}\n\n${locale.toUpperCase()}\n`;

    // we will retry up to 3 times to get the right number of translations
    let retries = 3;
    // @type {string[]}
    let translations = [];

    while (retries > 0 && translations.length !== batch.length) {
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 2048,
        temperature: 0.5,
        // no stop sequence, we want to translate all phrases
        stop: "",
      });

      translations = response.data.choices[0].text.split("\n");

      retries--;

      await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    }

    // add the translations to the final phrases
    finalPhrases = finalPhrases.concat(
      batch.map((phrase, index) => ({
        ...phrase,
        translation: translations[index].slice(2),
      }))
    );

    console.log(`${finalPhrases.length}/${totalPhrases} translated.`);
  }

  // update the original messages.po file with the translations
  const updatedLines = messages.split("\n");
  for (const phrase of finalPhrases) {
    updatedLines[phrase.line] = `msgstr "${phrase.translation}"`;
  }
  const updatedMessages = updatedLines.join("\n");

  // rewrite the messages.po file
  fs.writeFileSync(
    path.join("./src/locales/", locale, "messages.po"),
    updatedMessages
  );
}
