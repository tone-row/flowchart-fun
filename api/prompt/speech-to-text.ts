import { VercelApiHandler } from "@vercel/node";
import { openai } from "../_lib/_openai";
import { toFile } from "openai";

const handler: VercelApiHandler = async (req, res) => {
  try {
    const { audioUrl } = req.body;

    if (!audioUrl) {
      res.status(400).json({ ok: false, error: "No audioUrl provided" });
      return;
    }

    const base64Data = audioUrl.split(";base64,").pop();
    const binaryData = Buffer.from(base64Data, "base64");
    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(binaryData, "audio.mp4"),
      model: "whisper-1",
    });
    res.send(transcription.text);
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Something went wrong" });
  }
};

export default handler;
