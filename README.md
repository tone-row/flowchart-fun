<h1 style="text-align: center;">flowchart-fun ⿻ 🎨</h1>

<a href="https://flowchart.fun/" style=" display: block; font-size: 1.5em; text-align: center;">Running at https://flowchart.fun/</a>

![app](https://github.com/tone-row/flowchart-fun/blob/main/app.png?raw=true)

## Summary

flowchart.fun is a lightweight application to generate flowcharts and diagrams from text. It is built with [create-react-app](https://github.com/facebook/create-react-app) and [cytoscape.js](https://github.com/cytoscape/cytoscape.js)

This app also allows users to log in and save hosted charts, as well as send feedback. These features are built with [Vercel functions](https://vercel.com/docs/concepts/functions/introduction) / [supabase](https://supabase.io/), and [sendgrid](https://sendgrid.com/) respectively.

> Note: It's not necessary to configure these services to run a lightweight version of this app.
>
> Read below to find out more.

## Installation

1. Clone this repository
1. `cd flowchart-fun`
1. `yarn`

## How to run without login features

To run the app without login features, simply run `yarn start` in the root directory.

## How to run with login features

To run with full functionality you'll need accounts with vercel, sendgrid, supabase and stripe.

---

## Workspaces

This repository is organized in workspaces. [/app](/app) contains the code for the react application and [/module](/module) contains the code for the **deprecated** [flowchart-fun](https://www.npmjs.com/package/flowchart-fun) npm module.

## Contributing

This repo is always open to contributions. Before opening a PR with a new feature, consider opening an issue or discussion to gauge support and confirm your implementation.
