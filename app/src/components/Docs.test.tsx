import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { render, screen } from "../test-utils";

const server = setupServer(
  rest.get("/api/docs", (req, res, ctx) => {
    return res(ctx.json(fakeData));
  })
);

beforeAll(() => server.listen());
beforeEach(() => {
  window.flowchartFunSetHelpText = jest.fn();
});
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

import Docs from "./Docs";

describe("Docs", () => {
  test("should load docs", async () => {
    render(<Docs currentText="..." />);
    expect(await screen.findByTestId(/introduction/)).toBeInTheDocument();
  });

  test("button should be added to code samples", async () => {
    render(<Docs currentText="" />);
    const exampleButtons = await screen.findAllByText(/View Example/gi);
    expect(exampleButtons).toHaveLength(4);
    userEvent.click(exampleButtons[0]);
    expect(window.flowchartFunSetHelpText).toHaveBeenCalledTimes(1);
  });

  test("when code example matches we show active", async () => {
    render(<Docs currentText="My First Node" />);
    const example = await screen.findByTestId("active-code-example");
    expect(example).toBeInTheDocument();
    expect(example).toHaveTextContent("My First Node");
  });
});

const fakeData = {
  data:
    '<h2 id="introduction" data-testid="introduction">Introduction</h2>\n' +
    "<p>Welcome! flowchart.fun is a web app for making flowcharts (and other graphs) from text. This documentation explains how to make and style graphs, as well as save, share, and download them.</p>\n" +
    '<h2 id="creating-graphs-with-text">Creating Graphs with Text</h2>\n' +
    "<p>Most graphing applications are visual-editors that use drag and drop: flowchart.fun treats <strong>text</strong> as the source of truth. In order to build graphs with flowchart.fun, you type in the text editor while watching your graph update in real-time in the preview.</p>\n" +
    '<h3 id="creating-nodes">Creating Nodes</h3>\n' +
    "<p>Create a node by typing on any line:</p>\n" +
    '<pre class="code-sample"><code>My First Node</code></pre>\n' +
    "<p>Each line becomes its own node:</p>\n" +
    '<pre class="code-sample"><code>My First Node\n' +
    "My Second Node\n" +
    "My Third...</code></pre>\n" +
    '<h3 id="creating-edges">Creating Edges</h3>\n' +
    "<p>Edges in flowchart.fun are directed. A directed edge is created from <code>Node A</code> to <code>Node B</code>, if <code>Node B</code> is indented, and <code>Node A</code> is the first, less-indented line above it. <strong>Note: </strong>you can indent using spaces or tabs.</p>\n" +
    '<pre class="code-sample"><code>Node A\n' +
    "\tNode B</code></pre>\n" +
    "<p>This will be true of all the lines proceeding <code>Node A</code> – not just the one below it.</p>\n" +
    '<pre class="code-sample"><code>Node A\n' +
    "\tNode B\n" +
    "\tNode C\n" +
    "\tNode D</code></pre>\n",
};
