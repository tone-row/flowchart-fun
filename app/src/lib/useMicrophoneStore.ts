import { create } from "zustand";
type MicrophoneStore = {
  isMicOn: boolean;
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
  data: Blob[];
};

export const useMicrophoneStore = create<MicrophoneStore>((set) => ({
  isMicOn: false,
  isRecording: false,
  mediaRecorder: null,
  data: [],
}));

export function turnOnMicrophone(onFinish: () => void | Promise<void>) {
  const isMicOn = useMicrophoneStore.getState().isMicOn;
  if (isMicOn) return;

  // start the microphone listening to audio
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.addEventListener("dataavailable", (e) => {
        useMicrophoneStore.setState((state) => ({
          data: [...state.data, e.data],
        }));
      });

      mediaRecorder.addEventListener("start", () => {
        useMicrophoneStore.setState({ isRecording: true });
      });

      mediaRecorder.addEventListener("stop", () => {
        useMicrophoneStore.setState({ isRecording: false });
        onFinish();
      });

      useMicrophoneStore.setState({ isMicOn: true, mediaRecorder });
    })
    .catch(console.error);
}

export function startRecording() {
  const mediaRecorder = useMicrophoneStore.getState().mediaRecorder;
  if (!mediaRecorder) return;

  // Clear the data array
  useMicrophoneStore.setState({ data: [] });

  mediaRecorder.start();
}

export function stopRecording() {
  const mediaRecorder = useMicrophoneStore.getState().mediaRecorder;
  if (!mediaRecorder) return;

  mediaRecorder.stop();
}
