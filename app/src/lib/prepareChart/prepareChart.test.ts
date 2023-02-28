import { readFileSync } from "fs";
import { join } from "path";

import { initialDoc } from "../useDoc";
import { prepareChart } from "./prepareChart";

describe("prepareChart", () => {
  test("can migrate old files with yaml", () => {
    expect(prepareChart(getFixture("example1"))).toEqual({
      text: `This app works by typing
  Indenting creates a link to the current line
  any text: before a colon creates a label
  Create a link directly using the exact label text
    like this: (This app works by typing)
    [custom ID] or
      by adding an %5BID%5D and referencing that
        like this: (custom ID) // You can also use single-line comments
/*
or
multiline
comments

Have fun! 🎉
*/
`,
      meta: {
        layout: {
          name: "cose",
        },
        parser: "v1",
        theme: "original-dark",
      },
    });
  });

  test("can migrate old files with hidden options", () => {
    expect(prepareChart(getFixture("example2"))).toEqual({
      text: `long label text
  (c)
longer label text
  (c)
[c] the longest label text of all
`,
      meta: {
        nodePositions: {
          N14e: { x: 69.45580968418729, y: 42.97973028931095 },
          N150: { x: 112.02947631404595, y: 237.1117560181095 },
          c: { x: 91.4921875, y: 138.375 },
        },
        parser: "v1",
      },
    });
  });

  test("can migrate old files with neither", () => {
    expect(prepareChart(getFixture("example3"))).toEqual({
      text: `i am but a simple file\n`,
      meta: {
        parser: "v1",
      },
    });
  });

  test("can migrate old file with both", () => {
    expect(prepareChart(getFixture("example4"))).toEqual({
      text: `이 앱은 타이핑으로 작동합니다
  들여쓰기는 현재 줄에 대한 링크를 생성합니다
  콜론 앞의 모든 텍스트는: 레이블을 생성합니다
  정확한 레이블 텍스트를 사용하여 직접 링크 만들기
    이렇게: (이 앱은 타이핑으로 작동합니다)
    [사용자 지정 ID] 또는
      %5BID%5D를 추가하고 참조하여
        이렇게: (사용자 지정 ID) // 한 줄을 사용할 수도 있습니다 댓글
/*
또는
멀티라인
댓글

즐겨보세요! 🎉
*/
`,
      meta: {
        layout: {
          name: "cose",
        },
        theme: "clay",
        nodePositions: {
          N14e: { x: 260.27143997679184, y: 182.9157088415619 },
          N14f: { x: 67.24466938513544, y: 237.52532493169429 },
          N150: { x: 476.79315058009973, y: 295.00196703470885 },
          N151: { x: 146.89348657074046, y: 390.6525082094244 },
          "사용자 지정 ID": { x: 303.7526207140005, y: 295.324954187848 },
          N154: { x: 388.3411820878437, y: 404.7001951000867 },
        },
        parser: "v1",
      },
    });
  });

  test("can migrate new file", () => {
    expect(prepareChart(getFixture("example5"))).toEqual({
      text: `hello\n  to: the world\n`,
      meta: {
        layout: {
          name: "cose",
          rankDir: "BT",
        },
        theme: "eggs",
        parser: "v1",
      },
    });
  });

  test("can merge a mix of old and new", () => {
    expect(prepareChart(getFixture("example6"))).toEqual({
      meta: {
        layout: {
          name: "cose",
          rankDir: "LR",
        },
        parser: "v1",
        style: [
          {
            selector: "edge",
            style: {
              "line-style": "dashed",
            },
          },
          {
            selector: 'edge[source="#red"]',
            style: {
              "line-color": "lime",
              "target-arrow-color": "lime",
              width: 10,
            },
          },
        ],
        theme: "eggs",
      },
      text: `You can set all lines to be dashed
  B
    C
      [#red] D
        Or you can use the source or target or both to make some lines dashed
        x
        y
        z
`,
    });
  });

  test("trims whitespace and adds one newline to text", () => {
    expect(prepareChart(getFixture("example7"))).toEqual({
      text: `hello\n  to the: world\n`,
      meta: {
        layout: {
          name: "cose",
          rankDir: "BT",
        },
        parser: "v1",
        theme: "eggs",
      },
    });
  });

  test("if a document has a parser it shouldn't change", () => {
    expect(prepareChart(getFixture("example8"))).toEqual({
      details: {
        id: "",
        isHosted: false,
        title: "",
      },
      meta: {
        parser: "v1",
      },
      text: "old\n  [x] parser\n",
    });
  });

  test("if a document has no parser but has default text, add v1", () => {
    expect(prepareChart(getFixture("example9"))).toEqual({
      details: {
        id: "",
        isHosted: false,
        title: "",
      },
      meta: {
        parser: "v1",
      },
      text: "This app works by typing\n  Indenting creates a link to the current line\n  any text: before a colon creates a label\n",
    });
  });
});

function getFixture(name: string) {
  return readFileSync(join(__dirname, "examples", name), "utf8");
}
