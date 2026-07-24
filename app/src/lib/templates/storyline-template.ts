import { FFTheme } from "../FFTheme";

export const content = `
Scene 1\\: The lamp goes dark #start
  Climb the spiral stairs
    A stranger waits at the top
      trust her: Scene 2\\: Share the keeper's log
        Row out to the hidden cove
          Relight the lamp together .ending_good
      turn her away: Scene 3\\: Face the storm alone
        The ship strikes the rocks .ending_bad
        search the cellar: Find the brass key
          Unlock the sealed door
            The first keeper's ghost appears .ending_secret
              .loop_back loop: (#start)
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "DOWN",
  spacingFactor: 1.2,

  background: "#171221",
  fontFamily: "General Sans",

  shape: "roundrectangle",
  nodeBackground: "#221a30",
  nodeForeground: "#efe6d8",
  padding: 16,
  borderWidth: 1,
  borderColor: "#4a3c63",
  textMaxWidth: 168,
  lineHeight: 1.4,
  textMarginY: 0,
  useFixedHeight: false,
  fixedHeight: 50,

  curveStyle: "bezier",
  edgeWidth: 1.5,
  edgeColor: "#7b689f",
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 6,
  targetDistanceFromNode: 6,
  arrowScale: 0.8,
  edgeTextSize: 0.8125,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `@import url('/fonts/GeneralSans.css');

$paper: #efe6d8;
$candle: #d8a24a;
$night: #171221;
$veil: #4a3c63;
$good: #5a8a63;
$bad: #a03d3d;
$secret: #6f4f9e;
$grey: #3a3150;

:childless {
  corner-radius: 12;
  font-weight: 400;
  underlay-color: #0b0714;
  underlay-opacity: 0.4;
  underlay-padding: 4;
  underlay-shape: round-rectangle;
}

/* The opening scene glows like the lamp itself */
:childless[in_degree < 1] {
  border-color: $candle;
  border-width: 1.5;
  underlay-color: $candle;
  underlay-opacity: 0.12;
  underlay-padding: 8;
}

/* Choice labels float as pills on the night canvas */
edge {
  source-endpoint: outside-to-node;
  target-endpoint: outside-to-node;
  color: $candle;
  font-style: italic;
  text-background-opacity: 1;
  text-background-shape: round-rectangle;
  text-background-padding: 5;
  text-border-width: 1;
  text-border-color: $veil;
  text-border-opacity: 1;
}

/* A path already taken: dashed, curling back through the dark */
edge.loop_back {
  curve-style: unbundled-bezier;
  control-point-distances: 60;
  control-point-weights: 0.5;
  line-style: dashed;
  line-color: #6a5a86;
  target-arrow-color: #6a5a86;
  color: #9c8bbd;
  opacity: 0.9;
}

:parent {
  corner-radius: 14;
  border-width: 1;
  border-color: $veil;
  background-opacity: 0.5;
  color: #b8a9cf;
  font-size: 15;
  padding: 18;
}

/* Endings are pills, lit by their fate */
:childless.ending_good {
  corner-radius: 999;
  background-color: $good;
  border-color: #74a67e;
  color: white;
  font-weight: 500;
}
:childless.ending_bad {
  corner-radius: 999;
  background-color: $bad;
  border-color: #bd5a5a;
  color: white;
  font-weight: 500;
}
:childless.ending_secret {
  corner-radius: 999;
  background-color: $secret;
  border-color: #8d6cbd;
  color: white;
  font-weight: 500;
}

:childless:selected {
  underlay-color: $candle;
  underlay-opacity: 0.3;
  underlay-padding: 7;
  opacity: 1;
  border-color: $candle;
}

edge:selected {
  line-color: $candle;
  target-arrow-color: $candle;
  opacity: 1;
  width: 2.5;
}

:childless.color_red {
  background-color: #a03d3d;
  border-color: #bd5a5a;
  color: white;
}
:childless.color_orange {
  background-color: #b06a3a;
  border-color: #c98551;
  color: white;
}
:childless.color_yellow {
  background-color: #c9a84c;
  border-color: #dcbf6c;
  color: #2b2208;
}
:childless.color_green {
  background-color: #5a8a63;
  border-color: #74a67e;
  color: white;
}
:childless.color_blue {
  background-color: #4b6a94;
  border-color: #6685ad;
  color: white;
}
:childless.color_purple {
  background-color: #6f4f9e;
  border-color: #8d6cbd;
  color: white;
}
:childless.color_grey {
  background-color: $grey;
  border-color: #55486f;
  color: $paper;
}

:parent.color_white {
  background-color: $paper;
  color: #3a3150;
}
:parent.color_grey {
  background-color: $grey;
}
`;
