import { Microphone as MicrophoneIcon } from "phosphor-react";
import { IconButton2 } from "../ui/Shared";
import { useCallback } from "react";
import cx from "classnames";
import {
  startRecording,
  stopRecording,
  turnOnMicrophone,
  useMicrophoneStore,
} from "../lib/useMicrophoneStore";

/**
 * Records the user and then does something with the recording
 */
export function Microphone({
  onSend,
  onTranscription,
}: {
  onSend: () => void;
  onTranscription: (text: string) => void | Promise<void>;
}) {
  const isMicOn = useMicrophoneStore((s) => s.isMicOn);
  const isRecording = useMicrophoneStore((s) => s.isRecording);

  const handleFinishRecording = useCallback(() => {
    const audioBlob = new Blob(useMicrophoneStore.getState().data, {
      type: "audio/mp4",
    });

    // Get length in milliseconds
    const lengthInMS = audioBlob.size / audioBlob.type.length;

    // Don't send if the recording is too short
    if (lengthInMS < 2500) {
      return;
    }

    onSend();

    // Base64 encode the blob
    let audioUrl = "";
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      audioUrl = reader.result as string;

      // Send the base64 data to the server
      fetch("/api/prompt/speech-to-text", {
        method: "POST",
        body: JSON.stringify({ audioUrl }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.text())
        .then(onTranscription);
    };
  }, [onSend, onTranscription]);

  const turnOn = useCallback(() => {
    turnOnMicrophone(handleFinishRecording);
  }, [handleFinishRecording]);

  return (
    <IconButton2
      size="xs"
      className={cx("!absolute bottom-0 right-0", {
        "!bg-black !text-white": isMicOn && !isRecording,
        "!bg-red-500 !text-white": isMicOn && isRecording,
      })}
      type="button"
      onClick={turnOn}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
    >
      <MicrophoneIcon size={16} />
    </IconButton2>
  );
}
