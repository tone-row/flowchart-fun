import path from "path";
import fs from "fs";

// Get Directory for Template
const __filename = import.meta.url.slice(7);
const __dirname = path.dirname(__filename);

// Make sure folder to store screenshots exists
const screenshotsDir = path.join(__dirname, "../public/template-screenshots");

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
  console.log("Created folder: ", screenshotsDir);
}

// console.log(screenshotsDir);
