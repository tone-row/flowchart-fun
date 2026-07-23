import { FFTheme } from "../FFTheme";

export const content = `
User .icon_user
  opens: Web Client .icon_browser
    calls: API Gateway #gateway.icon_api
(#gateway)
  verifies: Auth Service .icon_lock.color_purple
  forwards: App Service #app.icon_server.color_blue
Private Network {
  Postgres #db.icon_database
  Redis Cache #cache.icon_database
  Job Queue #queue.icon_queue
}
(#app)
  queries: (#db)
  caches: (#cache)
  enqueues: (#queue)
(#queue)
  drains to: Email Worker .icon_server
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "RIGHT",
  spacingFactor: 1.2,

  background: "#0b1740",
  fontFamily: "Hubot Sans",

  shape: "roundrectangle",
  nodeBackground: "#101d4d",
  nodeForeground: "#eef3ff",
  padding: 16,
  borderWidth: 1.4,
  borderColor: "#b9c8ef",
  textMaxWidth: 140,
  lineHeight: 1.3,
  textMarginY: 0,
  useFixedHeight: false,
  fixedHeight: 50,

  curveStyle: "round-taxi",
  edgeWidth: 1.5,
  edgeColor: "#5f74b8",
  sourceArrowShape: "none",
  targetArrowShape: "vee",
  sourceDistanceFromNode: 4,
  targetDistanceFromNode: 4,
  arrowScale: 0.8,
  edgeTextSize: 0.875,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `@import url('/fonts/HubotSans.css');

$line: #b9c8ef;
$bright: #eef3ff;
$dim: #5f74b8;
$glow: #6ea8ff;
$red: #e0685f;
$orange: #e89a4e;
$yellow: #e8c94e;
$green: #4ecf97;
$blue: #6ea8ff;
$purple: #a98be8;
$grey: #8ba0cc;

:childless {
  corner-radius: 10;
  font-weight: 500;
  background-opacity: 0.92;
}

edge {
  taxi-radius: 14;
  line-style: dashed;
  source-endpoint: outside-to-node;
  target-endpoint: outside-to-node;
  text-background-padding: 4;
  color: $line;
  font-weight: 500;
}

:parent {
  corner-radius: 14;
  border-width: 1.5;
  border-style: dashed;
  border-color: #38508f;
  background-opacity: 0.06;
  color: $line;
  font-size: 15;
  font-weight: 500;
  padding: 18;
}

:childless:selected {
  underlay-color: $glow;
  underlay-opacity: 0.25;
  underlay-padding: 6;
  underlay-shape: round-rectangle;
  opacity: 1;
  border-color: $glow;
}

edge:selected {
  line-color: $glow;
  target-arrow-color: $glow;
  color: $bright;
  opacity: 1;
  width: 2.5;
}

/* Blueprint line icons (drawn at 24, rendered at 20) */
:childless.icon_user {
  background-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23b9c8ef'%20stroke-width='1.6'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='M20%2021v-2a4%204%200%200%200-4-4H8a4%204%200%200%200-4%204v2'/%3E%3Ccircle%20cx='12'%20cy='7'%20r='4'/%3E%3C/svg%3E");
}
:childless.icon_browser {
  background-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23b9c8ef'%20stroke-width='1.6'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Crect%20x='3'%20y='4'%20width='18'%20height='16'%20rx='2'/%3E%3Cpath%20d='M3%209h18'/%3E%3Cpath%20d='M6.2%206.6h.01'/%3E%3C/svg%3E");
}
:childless.icon_server {
  background-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23b9c8ef'%20stroke-width='1.6'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Crect%20x='3'%20y='3.5'%20width='18'%20height='7'%20rx='1.5'/%3E%3Crect%20x='3'%20y='13.5'%20width='18'%20height='7'%20rx='1.5'/%3E%3Cpath%20d='M7%207h.01'/%3E%3Cpath%20d='M7%2017h.01'/%3E%3C/svg%3E");
}
:childless.icon_api {
  background-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23b9c8ef'%20stroke-width='1.6'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='M9%206l-5%206%205%206'/%3E%3Cpath%20d='M15%206l5%206-5%206'/%3E%3C/svg%3E");
}
:childless.icon_database {
  background-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23b9c8ef'%20stroke-width='1.6'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cellipse%20cx='12'%20cy='5.5'%20rx='8'%20ry='2.7'/%3E%3Cpath%20d='M4%205.5v13c0%201.5%203.6%202.7%208%202.7s8-1.2%208-2.7v-13'/%3E%3Cpath%20d='M4%2012.2c0%201.5%203.6%202.7%208%202.7s8-1.2%208-2.7'/%3E%3C/svg%3E");
}
:childless.icon_queue {
  background-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23b9c8ef'%20stroke-width='1.6'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Crect%20x='4'%20y='4'%20width='16'%20height='4.4'%20rx='1.2'/%3E%3Crect%20x='4'%20y='9.8'%20width='16'%20height='4.4'%20rx='1.2'/%3E%3Crect%20x='4'%20y='15.6'%20width='16'%20height='4.4'%20rx='1.2'/%3E%3C/svg%3E");
}
:childless.icon_cloud {
  background-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23b9c8ef'%20stroke-width='1.6'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='M18%2010h-1.26A8%208%200%201%200%209%2020h9a5%205%200%200%200%200-10z'/%3E%3C/svg%3E");
}
:childless.icon_lock {
  background-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23b9c8ef'%20stroke-width='1.6'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Crect%20x='5'%20y='11'%20width='14'%20height='9'%20rx='2'/%3E%3Cpath%20d='M8%2011V7a4%204%200%200%201%208%200v4'/%3E%3C/svg%3E");
}

:childless.icon_user, :childless.icon_browser, :childless.icon_server, :childless.icon_api, :childless.icon_database, :childless.icon_queue, :childless.icon_cloud, :childless.icon_lock {
  background-clip: none;
  background-width: 20;
  background-height: 20;
  background-position-x: 12;
  background-position-y: 50%;
  text-margin-x: 12;
}

:childless.color_red {
  background-color: #43222f;
  border-color: $red;
  color: #ffe1de;
}
:childless.color_orange {
  background-color: #46301f;
  border-color: $orange;
  color: #ffe9d2;
}
:childless.color_yellow {
  background-color: #46401f;
  border-color: $yellow;
  color: #fff3c9;
}
:childless.color_green {
  background-color: #1d3a30;
  border-color: $green;
  color: #d7f5e7;
}
:childless.color_blue {
  background-color: #16295e;
  border-color: $blue;
  color: #dce9ff;
}
:childless.color_purple {
  background-color: #33235a;
  border-color: $purple;
  color: #e9defc;
}
:childless.color_grey {
  background-color: #232f52;
  border-color: $grey;
  color: #dbe3f5;
}

:parent.color_white {
  background-color: $bright;
}
:parent.color_grey {
  background-color: $grey;
}
`;
