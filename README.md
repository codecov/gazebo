[![codecov](https://codecov.io/gh/codecov/gazebo/branch/main/graph/badge.svg?token=UAP786D58M)](https://codecov.io/gh/codecov/gazebo)

# Gazebo

Gazebo is the Front-end SPA of Codecov. It's a greenfield project we kicked off in November 2020 with the ambition of rewriting all the legacy pages from [codecov.io](https://github.com/codecov/codecov.io) and [codecov-client](https://github.com/codecov/codecov-client) in a single repository with a more modern approach.

We decided to use React from our investigation [here](https://codecovio.atlassian.net/wiki/spaces/ENG/pages/825393161/React+investigation)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Prerequisites

We recommend using the same Node version as in CircleCI: [Node (Latest LTS)](https://nodejs.org/en/download/).
You can refer to the .nvmrc in the root folder.

## Run the project

To run the project in development mode

```bash
> npm install
> npm run start
```

The page will reload when you make edits. There is a local proxy to the staging API so you can develop against it. You can overwrite it by creating a `.env.local` file with it with the following:

```
PROXY_TO=http://localhost:5100
```

## Enviornment Variables

Gazebo supports enviornment files by default which become enviornment variables at run time.

You must prepend env variables with `REACT_APP_` to access during run time.

```
PROXY_TO=https://stage-api.codecov.dev
REACT_APP_MY_CUSTOM_VAR=foobar
```

```js
console.log(process.env.REACT_APP_MY_CUSTOM_VAR) // foobar
```

To override enviornment variables when working locally create a `.env.local` file, this file is ignored by git be default which will prevent accidental commits.

Currently there's two variables you may want to change when working locally:

- PROXY_TO (Change where Gazebo api services are pointing to)
- REACT_APP_MSW_BROWSER (boolean to enable mocking api requests in browser, see [How to mock HTTP responses in the browser](#How-to-mock-HTTP-responses-in-the-browser))

## Run tests

You can run the tests with

```bash
> npm run test
```

This script is using Jest, so any valid Jest options can be added to the command.

We are using the [Testing Library](https://testing-library.com/docs/react-testing-library/intro) to test the React components.

## Linting

```bash
> npm run test
```

will lint the whole project.

We have some extra rules to keep the code more maintainable:

- Complexity of max 5 per function: to prevent functions with a lot of of different outcome
- 10 max statements per function: to prevent a function doing too much
- 2 level of nested callbacks: to prevent complexity within nested functions
- Mandatory prop-types: as we don't have a Type system, this rule will help us have documented components

## Build the application for production

```bash
> npm run build
```

will build the application in the `build` folder. We currently use Netlify for deployment, which will be subject to change.

## Config

The config are centralized in one place in the file `config.js`. The file merges multiple configuration in one object:

- hardcoded configuration in that file
- the configuration from `process.env` [documentation here](https://create-react-app.dev/docs/adding-custom-environment-variables) which is set on build-time
- the configuration from `window.configEnv` which can be set on start-time

## How to mock HTTP responses in the browser:

Sometimes when working locally it helps to control API responses. For edge cases, for investigating support or on call incidents.

If you need to mock a response add `REACT_APP_MSW_BROWSER=true` to `.env.local` to enable browser mocks.
Mocks are located in `src/mocks/handlers`

Example:

```js
import { rest } from 'msw'

export const handlers = [
  rest.get('internal/user', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ mock: 'data' }))
  }),
]
```

Read more at the [official documentation.](https://mswjs.io/docs/getting-started/mocks/rest-api)

## Debugging failed checks

### Bundsize

We have a relatively agressive bundlesize check in place to ensure we serve a lean and performance web application.

As we add more features our bundle will grow over time. We will adjust these thresholds on a case by case basis. If you're running into this check; this command will allow us to investigate what is taking space in the final production build.

`npm run build -- --stats && npx webpack-bundle-analyzer ./build/bundle-stats.json`
