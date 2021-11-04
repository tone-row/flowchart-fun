# flowchart-fun ⿻

<div style="padding: 1em; background-color: var(--color-border-default, whitesmoke); text-align: center; border-radius: 6px;">

[Check out https://flowchart.fun/](https://flowchart.fun/)

</div>

![app](https://github.com/tone-row/flowchart-fun/blob/main/app.png?raw=true)

## Summary

flowchart.fun is a lightweight application to generate flowcharts and diagrams from text ⿻
It's built with [create-react-app](https://github.com/facebook/create-react-app) and [cytoscape.js](https://github.com/cytoscape/cytoscape.js)

The production version of this app allows users to log in and save hosted charts. This is built with [Vercel functions](https://vercel.com/docs/concepts/functions/introduction) and [supabase](https://supabase.io/).

However, it's not necessary to configure these services to run a lightweight version of this app. Read below to find out more.

## Installation

1. Clone this repository
1. `cd flowchart-fun`
1. `yarn`

## How to run without login features

To run the app without login features, simply run `yarn start` in the root directory.

## How to run this app with login features

...

---

This repository is organized in workspaces. [/app](/app) contains the code for https://flowchart.fun and [/module](/module) contains the code for the [flowchart-fun](https://www.npmjs.com/package/flowchart-fun) npm module

For more information on developing, check out [create-react-app's README](https://github.com/facebook/create-react-app/blob/master/README.md)

_NOTE_ – the module is no longer maintained

## Feedback / Backend Functionality

This app sends emails using Sendgrid and Vercel's serverless functions.

It's possible to run this app without the feedback functionality, but if you do wish to run it with the feedback functionality you will need to deploy it on vercel and set the `REACT_APP_FEEDBACK_TO` and `SENDGRID_API_KEY` environment variables.

## Contributing

This repo is always open to contributions. Before opening a PR with a new feature, consider opening an issue or discussion to gauge support and confirm your implementation.
