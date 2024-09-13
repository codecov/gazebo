[![codecov](https://codecov.io/gh/codecov/gazebo/branch/main/graph/badge.svg?token=UAP786D58M)](https://codecov.io/gh/codecov/gazebo)
[![Storybook](https://raw.githubusercontent.com/storybookjs/brand/master/badge/badge-storybook.svg)](https://5fa9228f77839a00217f8a45-bkjyepljyt.chromatic.com/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/128d65e5-70a2-4179-b216-4f16683513da/deploy-status)](https://app.netlify.com/sites/gazebo/deploys)

# Gazebo

> We believe that everyone should have access to quality software (like Sentry), that’s why we have always offered Codecov for free to open source maintainers.
>
> By making our code public, we’re not only joining the community that’s supported us from the start — but also want to make sure that every developer can contribute to and build on the Codecov experience.

Gazebo is the Front-end SPA of Codecov. It's a greenfield project we kicked off in November 2020 with the ambition of rewriting all the legacy pages from [codecov.io](https://github.com/codecov/codecov.io) and [codecov-client](https://github.com/codecov/codecov-client) in a single repository with a more modern approach.

We decided to use React from our investigation [here](https://codecovio.atlassian.net/wiki/spaces/ENG/pages/825393161/React+investigation)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Prerequisites

We recommend using the same Node version as in CircleCI: [Node (Latest LTS)](https://nodejs.org/en/download/).
You can refer to the .nvmrc in the root folder.

In order to use the Makefile to build a Docker image, you'll need to set an environment variable for `CODECOV_GAZEBO_IMAGE`. Set it to a string that will be used as a Docker image name to build to.

## Run the project

To run the project in development mode

```bash
> yarn
> yarn start
```

Note: The first run of `yarn start` may take 5-10 minutes to finish building.

The page will reload when you make edits. There is a local proxy to the staging API so you can develop against it. You can overwrite it by creating a `.env.local` file with it with the following:

```
PROXY_TO=http://localhost:5100
```

## Run tests

You can run the tests with

```bash
> yarn test
```

This script is using Jest, so any valid Jest options can be added to the command.

We are using the [Testing Library](https://testing-library.com/docs/react-testing-library/intro) to test the React components.

## Linting

```bash
> yarn lint
```

will lint the whole project.

## Build the application for production

```bash
> yarn build
```

will build the application in the `build` folder. We currently use Netlify for deployment, which will be subject to change.

## Config

The config are centralized in one place in the file `config.js`. The file merges multiple configuration in one object:

- hardcoded configuration in that file
- the configuration from [process.env](#process.env) which is set on build-time
- the configuration from `window.configEnv` which can be set on start-time

### process.env

Gazebo supports [env files](https://create-react-app.dev/docs/adding-custom-environment-variables) by default which become environment variables at build-time.

To override environment variables when working locally create a `.env.local` file, this file is ignored by git.

You must prepend env variables with `REACT_APP`.

`.env.local`

```
PROXY_TO=https://stage-api.codecov.dev
REACT_APP_MY_CUSTOM_VAR=foobar
REACT_APP_BASE_URL=http://localhost
```

`/src/somefile.js`

```js
import config from 'config'
console.log(config.MY_CUSTOM_VAR) // foobar
```

Currently there's three env variables you may want to change when working locally:

- PROXY_TO (Change where Gazebo api services are pointing to)
- REACT_APP_MSW_BROWSER (boolean to enable mocking api requests in browser, see [How to mock HTTP responses in the browser](#How-to-mock-HTTP-responses-in-the-browser))
- REACT_APP_BASE_URL (This is the base url where the legacy web container resides, needed for login/signout links)

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

## Contributing

This repository, like all of Codecov's repositories, strives to follow our general [Contributing guidelines](https://github.com/codecov/contributing). If you're considering making a contribution to this repository, we encourage review of our Contributing guidelines first.
