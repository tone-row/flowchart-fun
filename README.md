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

### Start DEV server using docker
1. `git clone`
1. `cd flowchart-fun`
1. `docker build -t flowchart-fun .`
1. `docker run -p 3035:3000 flowchart-fun`

Now you can access the flowchar app on [http://localhost:3035](http://localhost:3035)

For more information on creating a docker for production  please follow first [create-react-app's README](https://github.com/facebook/create-react-app/blob/master/README.md) and then use the environment variables and docker-compose to create the  production ready server.

## Contributing

This repo is always open to contributions. Before opening a PR with a new feature, consider opening an issue or discussion to gauge support and confirm your implementation.
