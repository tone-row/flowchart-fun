export default async function handler(req, res) {
  try {
    if (!process.env.SENDGRID_API_KEY)
      throw new Error("Missing sendgrid API Key");

    const mail = require("@sendgrid/mail");
    mail.setApiKey(process.env.SENDGRID_API_KEY);

    const { email } = req.body;
    if (!email) throw new Error("Missing information");

    mail
      .send(email)
      .then(() => {
        return res.json({ success: true });
      })
      .catch((error) => {
        throw new Error(error);
      });
  } catch (err) {
    res.json({ success: false });
  }
}
