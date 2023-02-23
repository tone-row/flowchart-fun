import mail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) throw new Error("No Sendgrid API key provided");

mail.setApiKey(apiKey);

export { mail };
