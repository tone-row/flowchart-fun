# flowchart-fun ⿻

## 👉 &nbsp;https://flowchart.fun/

Generate charts from text ⿻
Made with [create-react-app](https://github.com/facebook/create-react-app) and [cytoscape.js](https://github.com/cytoscape/cytoscape.js)

![app](https://github.com/tone-row/flowchart-fun/blob/main/app.png?raw=true)

## How to Run

1. `git clone`
1. `cd flowchart-fun`
1. `yarn`
1. `yarn start`

This repository is organized in workspaces. [/app](/app) contains the code for https://flowchart.fun and [/module](/module) contains the code for the [flowchart-fun](https://www.npmjs.com/package/flowchart-fun) npm module

For more information on developing, check out [create-react-app's README](https://github.com/facebook/create-react-app/blob/master/README.md)

_NOTE_ – the module is no longer maintained

## Feedback / Backend Functionality

This app sends emails using Sendgrid and Vercel's serverless functions.

It's possible to run this app without the feedback functionality, but if you do wish to run it with the feedback functionality you will need to deploy it on vercel and set the `REACT_APP_FEEDBACK_TO` and `SENDGRID_API_KEY` environment variables.

## Contributing

This repo is always open to contributions. Before opening a PR with a new feature, consider opening an issue or discussion to gauge support and confirm your implementation.
