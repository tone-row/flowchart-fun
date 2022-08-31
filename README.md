# [Flowchart Fun](https://flowchart.fun/)

A webapp for generating flowcharts from text @ https://flowchart.fun

![screenshot of Flowchart Fun](https://github.com/tone-row/flowchart-fun/blob/main/app.png?raw=true)

## Summary

Flowchart Fun is a webapp for generating flowcharts from text built with React and [cytoscape.js](https://github.com/cytoscape/cytoscape.js).

### Example

```
Node A
  goes to: Node B
  and: Node C
    goes back to: (Node A)
```

![example flowchart](./example1.png)

## Development

### Prerequisites

Premium features including auth, hosted charts and permalinks are built using integrations with [Vercel Functions](https://vercel.com/docs/concepts/functions/introduction), [Supabase](https://supabase.io/), [Stripe](https://stripe.com/) and [Sendgrid](https://sendgrid.com/) so you will need accounts with each of those services.

### Getting Started

1. Clone the repository
1. Copy `.env.example` to `.env` and add env variables
1. `pnpm install` and `pnpm start`

#### To run with login features:

`pnpm start`

#### To run without login features:

`pnpm dev`

## Release

1. Branch from `dev` to develop a feature
1. **Squash** and merge the feature branch into `dev`
1. (Repeat until happy)
1. Update version in /app/package.json and commit directly to `dev`. Push.
1. Open PR from `dev` to `main`
1. Merge (**do not squash!**) PR and a new github release will be created

## Contributing

We always welcome contributions! Before opening a pull request with a new feature, consider opening an issue or discussion to gauge support and/or confirm your implementation.
