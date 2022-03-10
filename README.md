# [flowchart.fun](https://flowchart.fun/)

https://flowchart.fun | Generate diagrams from text

<a href="https://www.producthunt.com/posts/flowchart-fun?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-flowchart-fun" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=286540&theme=dark" alt="flowchart.fun - A versatile app for generating flowcharts from text | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

![app](https://github.com/tone-row/flowchart-fun/blob/main/app.png?raw=true)

## Summary

flowchart.fun is a lightweight application to generate flowcharts and diagrams from text. It is built with [create-react-app](https://github.com/facebook/create-react-app) and [cytoscape.js](https://github.com/cytoscape/cytoscape.js) This app also allows users to log in and save hosted charts, as well as send feedback. These features are built with [Vercel functions](https://vercel.com/docs/concepts/functions/introduction) / [supabase](https://supabase.io/), and [sendgrid](https://sendgrid.com/) respectively.

**Note:** It's not necessary to configure these services to run a lightweight version of this app. Read below to find out more.

## Installation

1. Clone this repository
1. `cd flowchart-fun`
1. `yarn`

## How to run without login features

`yarn start`

## How to run with login features

To run with full functionality you'll need accounts with vercel, sendgrid, supabase and stripe. Then you'll need to copy and fill the environment variables in _app/.env.example_ to _app/.env_. Then

`vercel dev`

## Workspaces

This repository is organized in workspaces. [/app](/app) contains the code for the react application and [/module](/module) contains the code for the **deprecated** [flowchart-fun](https://www.npmjs.com/package/flowchart-fun) npm module.

# Releasing

Documenting so as not to forget!

- Work on feature branches which are merged to `dev`
- When ready to release update version in /app/package.json and merge directly to `dev`
- Open pull request from `dev` to `main`
- Merging pull request should create new github release

## Contributing

We always welcome contributions! Before opening a pull request with a new feature, consider opening an issue or discussion to gauge support and/or confirm your implementation.
