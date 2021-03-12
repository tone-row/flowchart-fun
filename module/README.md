# flowchart-fun

## With `npx`:

```
npx flowchart-fun -i <textfile_path> -o <svg_path>
```

Example:

```
npx flowchart-fun -i mycharttext -o chart.svg
```

## To use programmatically

```
const { generate } = require("flowchart-fun");

const text = `
this
  is: a
      pretty cool: chart
`;

generate({
  text,
  outputPath: "chart.svg",
});
```
