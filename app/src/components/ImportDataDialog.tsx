import { Trans } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import * as Progress from "@radix-ui/react-progress";
import {
  CircleNotch,
  Database,
  File,
  FileCsv,
  Warning,
  X,
} from "phosphor-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { Content, Overlay } from "../ui/Dialog";
import { EditorActionTextButton } from "../ui/EditorActionTextButton";

type UseImportData = {
  isProcessing: boolean;
  step: "upload" | "processing" | "mapping" | "error";
  errorMessage: string;
  filename: string;
};

const defaultImportData: UseImportData = {
  isProcessing: false,
  step: "upload",
  filename: "",
  errorMessage: "",
};

const useImportData = create<UseImportData>()(
  devtools((_set) => defaultImportData, {
    name: "useImportData",
  })
);

function resetForm() {
  useImportData.setState(defaultImportData);
}

export function ImportDataDialog() {
  const step = useImportData((state) => state.step);
  return (
    <Dialog.Root
      modal
      onOpenChange={(state) => {
        if (!state) {
          resetForm();
        }
      }}
    >
      <Dialog.Trigger asChild>
        <EditorActionTextButton icon={Database}>
          Import Data
        </EditorActionTextButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Overlay />
        <Content
          maxWidthClass="max-w-[600px]"
          className="min-h-[350px] content-start"
        >
          <Dialog.Title className="text-2xl font-bold flex items-center">
            <Database className="mr-2" />
            Import Data
          </Dialog.Title>
          <Dialog.Description asChild>
            <div className="grid gap-2">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                <Trans>Import data from a CSV file.</Trans>
              </p>
              {step === "upload" && <UploadFile />}
              {step === "processing" && <ProcessingData />}
              {step === "mapping" && <MappingData />}
              {step === "error" && <ErrorMessage />}
            </div>
          </Dialog.Description>
          <Dialog.Close className="absolute top-4 right-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
            <X />
          </Dialog.Close>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold mt-4 mb-2">{children}</h2>;
}

const UploadFile = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setUploadProgress(0);
      setFile(file);

      // read the file with file reader, update progress, console log the result
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      };
      reader.onload = (e) => {
        const text = e.target?.result as string;
        fetch("/api/import-data", {
          method: "POST",
          headers: {
            "Content-Type": "text/csv",
          },
          body: text,
        })
          .then((res) => {
            if (!res.ok) {
              res.text().then((text) => {
                useImportData.setState({
                  errorMessage: text,
                  step: "error",
                });
              });
            }
            return res.json();
          })
          .then((data) => {
            // TODO: set the initial form state, along with everything needed
            // to make the form operable
            console.log(data);
          })
          .catch((err) => {
            useImportData.setState({
              errorMessage: err.message,
              step: "error",
            });
          });

        // Minimum time before transitioning, to allow for animation
        setTimeout(() => {
          useImportData.setState({
            filename: file.name,
            isProcessing: true,
            step: "processing",
          });
        }, 750);
      };
      reader.readAsText(file);
    },
    accept: {
      "text/csv": ["*"],
    },
  });

  return (
    <>
      <H2>Upload your File</H2>
      {file ? (
        <>
          <div className="border-2 border-solid border-blue-300 dark:border-blue-700 rounded-lg p-4 text-center cursor-pointer grid gap-2 content-center justify-center h-36 bg-blue-100 dark:bg-blue-800">
            <div className="flex items-center gap-2">
              <File className="w-10 h-10 text-blue-400 dark:text-blue-600" />
              <span className="text-xl font-bold text-blue-500 dark:text-blue-400">
                {file.name}
              </span>
            </div>
          </div>
          <Progress.Root
            className="relative overflow-hidden rounded-full w-full h-2 bg-neutral-300 dark:bg-neutral-700"
            style={{
              // Fix overflow clipping in Safari
              // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
              transform: "translateZ(0)",
            }}
            value={uploadProgress}
          >
            <Progress.Indicator
              className="w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)] bg-blue-500"
              style={{ transform: `translateX(-${100 - uploadProgress}%)` }}
            />
          </Progress.Root>
        </>
      ) : (
        <div
          {...getRootProps()}
          data-drag-active={isDragActive}
          className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-4 text-center cursor-pointer data-[drag-active=true]:border-neutral-500 dark:data-[drag-active=true]:border-neutral-400 focus:outline-none grid gap-2 content-center justify-center h-36"
        >
          <input {...getInputProps()} />
          <FileCsv className="w-12 h-12 mx-auto text-neutral-400 dark:text-neutral-600" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            {isDragActive ? (
              <Trans>Drop the file here ...</Trans>
            ) : (
              <Trans>
                Drag and drop a CSV file here, or click to select a file
              </Trans>
            )}
          </p>
        </div>
      )}
    </>
  );
};

/**
 * A centered loading spinner that says "Processing Data"
 */
function ProcessingData() {
  return (
    <div className="flex flex-col items-center gap-2 h-48 justify-center">
      <div className="animate-spin animate-spin-slow">
        <CircleNotch className="w-12 h-12 text-blue-500 dark:text-blue-400" />
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        <Trans>Processing Data</Trans>
      </p>
    </div>
  );
}

function MappingData() {
  return <div>hi</div>;
}

function ErrorMessage() {
  const errorMessage = useImportData((state) => state.errorMessage);
  return (
    <div className="grid gap-4">
      <div className="bg-red-100 dark:bg-red-800 rounded-lg p-4 grid content-center justify-center">
        <div className="flex items-center gap-2 items-center">
          <Warning className="w-6 h-6 text-red-500 dark:text-red-400" />
          <p className="text-red-500 dark:text-red-400">{errorMessage}</p>
        </div>
      </div>
      <button
        className="text-neutral-500 text-sm focus:shadow-none dark:text-neutral-400"
        onClick={resetForm}
      >
        <Trans>Start Over</Trans>
      </button>
    </div>
  );
}
