import { t, Trans } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import * as Progress from "@radix-ui/react-progress";
import * as RadioGroup from "@radix-ui/react-radio-group";

import { CircleNotch, Database, File, FileCsv, Warning } from "phosphor-react";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "react-query";
import { ImportDataFormType } from "shared";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { useDoc } from "../lib/useDoc";
import { Close, Content, Overlay } from "../ui/Dialog";
import { EditorActionTextButton } from "../ui/EditorActionTextButton";
import { Button2 } from "../ui/Shared";

type UseImportData = {
  isProcessing: boolean;
  step: "upload" | "processing" | "mapping" | "error" | "confirm";
  errorMessage: string;
  filename: string;
  columnNames: string[];
  columnValues: Record<string, any[]>;
  /** The parsed CSV data */
  records: Record<string, any>[];
  processingErrorMessage?: string;
  numNodes: number;
  numEdges: number;
  graphString: string;
};

const defaultImportData: UseImportData = {
  isProcessing: false,
  step: "upload",
  filename: "",
  errorMessage: "",
  columnNames: [],
  columnValues: {},
  records: [],
  processingErrorMessage: undefined,
  numNodes: 0,
  numEdges: 0,
  graphString: "",
};

const focusStates =
  "focus-visible:outline-none focus:shadow-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:z-50 focus-visible:border-transparent dark:focus-visible:ring-blue-700";

const borderStyles = "border-neutral-300 dark:border-neutral-700";
const inputStyles = `p-2 border ${borderStyles} rounded ${focusStates} bg-background dark:bg-foreground`;
/**
 * Store the current step of the data importing process along with used data
 */
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
          <Trans>Import Data</Trans>
        </EditorActionTextButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Overlay />
        <Content
          overflowV
          maxWidthClass="max-w-[600px]"
          className="content-start overflow-y-auto"
        >
          <Close />
          <Dialog.Title className="text-2xl font-bold flex items-center">
            <Database className="mr-2" />
            <Trans>Import Data</Trans>
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
              {step === "confirm" && <ConfirmAddNodesAndEdges />}
            </div>
          </Dialog.Description>
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
        fetch("/api/data/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        })
          .then((res) => {
            if (!res.ok) {
              res.text().then((text) => {
                useImportData.setState({
                  errorMessage: text,
                  step: "error",
                });
              });
              throw new Error("Response Not OK");
            }
            return res.json() as Promise<{
              columnNames: string[];
              columnValues: Record<string, any[]>;
              records: Record<string, any>[];
            }>;
          })
          .then((data) => {
            // TODO: set the initial form state, along with everything needed
            // to make the form operable
            useImportData.setState({
              step: "mapping",
              columnNames: data.columnNames,
              columnValues: data.columnValues,
              records: data.records,
            });
          })
          .catch((err) => {
            useImportData.setState({
              errorMessage: err.message,
              step: "error",
            });
          });

        // Minimum time before transitioning, to allow for animation
        setTimeout(() => {
          // if the step is not already mapping well show processing screen
          // and the step is not an error
          if (
            useImportData.getState().step !== "mapping" &&
            useImportData.getState().step !== "error"
          )
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
      <H2>
        <Trans>Upload your File</Trans>
      </H2>
      {file ? (
        <>
          <div className="border-2 border-solid border-blue-300 dark:border-blue-700 rounded-lg p-4 text-center cursor-pointer grid gap-2 content-center justify-center h-36 bg-blue-100 dark:bg-blue-800/50">
            <div className="flex items-center gap-2">
              <File className="w-10 h-10 text-blue-400 dark:text-blue-500" />
              <span className="text-xl font-bold text-blue-500 dark:text-blue-300">
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
              className="w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)] bg-blue-500 dark:bg-neutral-400"
              style={{ transform: `translateX(-${100 - uploadProgress}%)` }}
            />
          </Progress.Root>
        </>
      ) : (
        <div
          {...getRootProps()}
          data-drag-active={isDragActive}
          className={`border-2 border-dashed ${borderStyles} rounded-lg p-4 text-center cursor-pointer data-[drag-active=true]:border-neutral-500 dark:data-[drag-active=true]:border-neutral-400 focus:outline-none grid gap-2 content-center justify-center h-36`}
          id="import-data-file-uploader-container"
        >
          <input data-testid="import-data-file-uploader" {...getInputProps()} />
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

function ErrorMessage() {
  const errorMessage = useImportData((state) => state.errorMessage);
  return (
    <div className="grid gap-4">
      <SmallErrorMessage>{errorMessage}</SmallErrorMessage>
      <Button2 onClick={resetForm}>
        <Trans>Start Over</Trans>
      </Button2>
    </div>
  );
}

function SmallErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-red-100 dark:bg-red-800 rounded-lg p-4 grid content-center justify-center">
      <div className="flex items-center gap-2 items-center">
        <Warning className="w-6 h-6 text-red-500 dark:text-red-200" />
        <p className="text-red-500 dark:text-red-200">{children}</p>
      </div>
    </div>
  );
}

const MappingData = () => {
  const columnNames = useImportData((state) => state.columnNames);
  const columnSelectionValues = useMemo(
    () =>
      columnNames.map((name) => ({
        text: name,
        value: name,
      })),
    [columnNames]
  );
  const columnSelectionValuesWithNone = useMemo(
    () => [
      {
        text: "None",
        value: "",
      },
      ...columnSelectionValues,
    ],
    [columnSelectionValues]
  );
  const columnValues = useImportData((state) => state.columnValues);
  const [formState, setFormState] = useState<ImportDataFormType>({
    idColumn: columnNames[0],
    nodeLabelColumn: columnNames[0],
    edgesDeclared: "none",
  });

  const handleFormChange = (name: string, value: string) => {
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const processingErrorMessage = useImportData(
    (state) => state.processingErrorMessage
  );

  const onSubmit = useMutation(
    "process-data",
    async (formState: ImportDataFormType) => {
      await fetch("/api/data/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mapping: formState,
          data: useImportData.getState().records,
        }),
      }).then((res) => {
        if (res.ok) {
          // move to the next step
          (
            res.json() as Promise<{
              numNodes: number;
              numEdges: number;
              graphString: string;
            }>
          ).then((data) => {
            // here we would set the final data and ask for confirmation
            useImportData.setState({
              step: "confirm",
              numNodes: data.numNodes,
              numEdges: data.numEdges,
              graphString: data.graphString,
            });
          });
        } else {
          res.text().then((text) => {
            useImportData.setState({
              processingErrorMessage: text,
              step: "mapping",
            });
          });
        }
      });
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit.mutate(formState);
      }}
      className="grid gap-5"
    >
      <H2>
        <Trans>Map Data</Trans>
      </H2>
      {processingErrorMessage && (
        <SmallErrorMessage>{processingErrorMessage}</SmallErrorMessage>
      )}
      <Label label={t`Node ID`}>
        <RegularSelect
          value={formState.idColumn}
          onChange={(e) => handleFormChange("idColumn", e.target.value)}
          items={columnSelectionValues}
          testId="node-id-select"
        />
      </Label>
      <Label label={t`Node Label`}>
        <RegularSelect
          value={formState.nodeLabelColumn}
          onChange={(e) => handleFormChange("nodeLabelColumn", e.target.value)}
          items={columnSelectionValues}
          testId="node-label-select"
        />
      </Label>
      <Label
        label={t`Edges`}
        description={t`How are edges declared in this data?`}
      >
        <RadioGroup.Root
          value={formState.edgesDeclared}
          orientation="vertical"
          onValueChange={(value) => {
            handleFormChange("edgesDeclared", value);
          }}
        >
          <RadioLabel
            value="none"
            title={t`No Edges`}
            description={t`There are no edges in this data`}
          />
          <RadioLabel
            value="sourceNode"
            title={t`Edges in Source Node Row`}
            description={t`Edges are declared in the same row as their source node`}
            data-testid="edges-in-source-node-row"
          />
          <RadioLabel
            value="targetNode"
            title={t`Edges in Target Node Row`}
            description={t`Edges are declared in the same row as their target node`}
          />
          <RadioLabel
            value="separateRows"
            title={t`Edges in Separate Rows`}
            description={t`Edges are declared in their own row`}
          />
        </RadioGroup.Root>
      </Label>
      {formState.edgesDeclared === "sourceNode" ? (
        <>
          <Label
            label={t`Target Column`}
            description={t`The column that contains the target node ID(s)`}
          >
            <RegularSelect
              value={formState.targetColumn}
              onChange={(e) => handleFormChange("targetColumn", e.target.value)}
              items={columnSelectionValues}
              testId="target-column-select"
            />
          </Label>
          <Label
            label={t`Target Delimiter`}
            description={t`The delimiter used to separate multiple target nodes`}
          >
            <input
              type="text"
              name="targetDelimiter"
              value={formState.targetDelimiter ?? ""}
              onChange={(e) => {
                handleFormChange("targetDelimiter", e.target.value);
              }}
              className={inputStyles}
              data-testid="target-delimiter-input"
            />
          </Label>
          <Label
            label={t`Edge Label Column`}
            description={t`The column that contains the edge label(s)`}
          >
            <RegularSelect
              value={formState.edgeLabelColumn}
              defaultValue=""
              onChange={(e) =>
                handleFormChange("edgeLabelColumn", e.target.value)
              }
              items={columnSelectionValuesWithNone}
              testId="edge-label-column-select"
            />
          </Label>
        </>
      ) : formState.edgesDeclared === "targetNode" ? (
        <>
          <Label
            label={t`Source Column`}
            description={t`The column that contains the source node ID(s)`}
          >
            <RegularSelect
              value={formState.sourceColumn}
              onChange={(e) => handleFormChange("sourceColumn", e.target.value)}
              items={columnSelectionValues}
            />
          </Label>
          <Label
            label={t`Source Delimiter`}
            description={t`The delimiter used to separate multiple source nodes`}
          >
            <input
              type="text"
              name="sourceDelimiter"
              value={formState.sourceDelimiter ?? ""}
              onChange={(e) => {
                handleFormChange("sourceDelimiter", e.target.value);
              }}
              className={inputStyles}
            />
          </Label>
          <Label label={t`Edge Label Column`}>
            <RegularSelect
              value={formState.edgeLabelColumn}
              defaultValue=""
              onChange={(e) =>
                handleFormChange("edgeLabelColumn", e.target.value)
              }
              items={columnSelectionValuesWithNone}
            />
          </Label>
        </>
      ) : formState.edgesDeclared === "separateRows" ? (
        <>
          <Label label={t`Source Column`}>
            <RegularSelect
              value={formState.sourceColumn}
              onChange={(e) => handleFormChange("sourceColumn", e.target.value)}
              items={columnSelectionValues}
            />
          </Label>
          <Label label={t`Target Column`}>
            <RegularSelect
              value={formState.targetColumn}
              onChange={(e) => handleFormChange("targetColumn", e.target.value)}
              items={columnSelectionValues}
            />
          </Label>
          <h2 className="mt-2 italics text-neutral-600">
            Row Represents Edge When...
          </h2>
          <Label label={t`Column`}>
            <RegularSelect
              value={formState.rowRepresentsEdgeWhenColumn}
              onChange={(e) =>
                handleFormChange("rowRepresentsEdgeWhenColumn", e.target.value)
              }
              items={columnSelectionValues}
            />
          </Label>
          <Label label={t`Is`}>
            <RegularSelect
              value={formState.rowRepresentsEdgeWhenIs}
              onChange={(e) =>
                handleFormChange("rowRepresentsEdgeWhenIs", e.target.value)
              }
              items={[
                { text: t`Empty`, value: "empty" },
                { text: t`Not Empty`, value: "notEmpty" },
                { text: t`Equal To`, value: "equals" },
              ]}
            />
          </Label>
          {formState.rowRepresentsEdgeWhenIs === "equals" ? (
            <Label label={`Value`}>
              <RegularSelect
                value={formState.rowRepresentsEdgeWhenValue}
                onChange={(e) =>
                  handleFormChange("rowRepresentsEdgeWhenValue", e.target.value)
                }
                items={columnValues[formState.rowRepresentsEdgeWhenColumn].map(
                  (value) => ({ text: value, value })
                )}
              />
            </Label>
          ) : null}
        </>
      ) : null}
      <Button2
        type="submit"
        data-testid="import-submit-button"
        color="blue"
        isLoading={onSubmit.isLoading}
      >
        <Trans>Submit</Trans>
      </Button2>
    </form>
  );
};

function Label({
  children,
  label,
  description,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  label: string;
  description?: string;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div {...props} className={`grid gap-2 ${className}`}>
      <div className="grid">
        <LabelSpan>{label}</LabelSpan>
        {description ? <Description>{description}</Description> : null}
      </div>
      {children}
    </div>
  );
}

function LabelSpan({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-base font-bold text-foreground/90 dark:text-background/90">
      {children}
    </span>
  );
}

function RegularSelect({
  items,
  placeholder,
  testId,
  ...props
}: {
  items: {
    value: string;
    text: string;
  }[];
  placeholder?: string;
  testId?: string;
} & React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>) {
  return (
    <select
      className={`p-2 border ${borderStyles} rounded ${focusStates} bg-background dark:bg-foreground`}
      data-testid={testId}
      {...props}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {items.map((item) => (
        <option value={item.value} key={item.value}>
          {item.text}
        </option>
      ))}
    </select>
  );
}

function Description({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-foreground/60 dark:text-background/60">
      {children}
    </p>
  );
}

function RadioLabel({
  title,
  description,
  ...props
}: {
  title: string;
  description: string;
} & RadioGroup.RadioGroupItemProps) {
  return (
    <RadioGroup.Item
      className={`grid w-full p-3 pr-2 grid-flow-col gap-2 items-center grid-cols-[minmax(0,1fr)_auto] border border-t-0 border-solid border-neutral-300 dark:border-neutral-700 first:rounded-t last:rounded-b first:border-t hover:bg-neutral-200 dark:hover:bg-neutral-800 ${focusStates} data-[state=checked]:bg-blue-100 data-[state=checked]:dark:bg-blue-900`}
      {...props}
    >
      <div className="grid gap-1 text-left">
        <span className="text-sm">{title}</span>
        <Description>{description}</Description>
      </div>
      <div
        className={`w-6 h-6 rounded-md border border-solid ${borderStyles} grid content-center justify-center`}
      >
        <RadioGroup.Indicator className="w-4 h-4 rounded bg-neutral-300 data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-400" />
      </div>
    </RadioGroup.Item>
  );
}

/**
 * Ask user to confirm adding number of nodes and edges
 */
function ConfirmAddNodesAndEdges() {
  const numNodes = useImportData((state) => state.numNodes);
  const numEdges = useImportData((state) => state.numEdges);
  const graphString = useImportData((state) => state.graphString);

  return (
    <div className="grid gap-4">
      <p>
        {t`You are about to add ${numNodes} nodes and ${numEdges} edges to your graph.`}
      </p>
      <p>{t`Would you like to continue?`}</p>
      <div className="flex gap-2 justify-self-end">
        <Dialog.Close asChild>
          <Button2>{t`Cancel`}</Button2>
        </Dialog.Close>
        <Dialog.Close asChild>
          <Button2
            onClick={() => {
              useDoc.setState((state) => ({
                text: state.text.trim()
                  ? `${state.text}\n\n${graphString}`
                  : graphString,
              }));
            }}
            color="blue"
          >
            {t`Continue`}
          </Button2>
        </Dialog.Close>
      </div>
    </div>
  );
}
