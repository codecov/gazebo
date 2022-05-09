[![codecov](https://codecov.io/gh/codecov/gazebo/branch/main/graph/badge.svg?token=UAP786D58M)](https://codecov.io/gh/codecov/gazebo)
[![Storybook](https://raw.githubusercontent.com/storybookjs/brand/master/badge/badge-storybook.svg)](https://5fa9228f77839a00217f8a45-bkjyepljyt.chromatic.com/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/128d65e5-70a2-4179-b216-4f16683513da/deploy-status)](https://app.netlify.com/sites/gazebo/deploys)

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

## Run tests

You can run the tests with

```bash
> npm run test
```

This script is using Jest, so any valid Jest options can be added to the command.

We are using the [Testing Library](https://testing-library.com/docs/react-testing-library/intro) to test the React components.

## Mutation testing

##### NOTE: Mutation testing is not yet configured to auto run or added to the CI/CD, _running mutation tests app wide is extremely slow_ so it's limited for now but you can run them on any code you want.

You can run to default configuration of mutation tests. (Located in mutate ket in `stryker.conf.js` file)

```bash
> npx stryker run
```

Alternatively you can look at the mutation score of a specific file you're working on. This will run mutation tests both on your
file and where ever your file is being used.

```bash
> npx stryker run --mutate src/shared/utils/url.js
```

### Reading the result

##### TODO: Write a proper guide on stryker in confluence and link it here

Once the mutation suite is complete it should output a table with the results as well as a link to view a html report.

> example: `file:///Users/ts/dev/gazebo/reports/mutation/html/index.html`

From the html report you can view the mutates or specific tests and click on the round dots for more information on the result.

"Mutants" are copies of our source code which have been tampered with, we expect good tests to have failed (killed) if the source code
failed, if they still pass the mutant is considered to have survived.

The mutation score is a highlevel estimation of the health/bugs in the codebase, it's not possible to automatically have a 100%
score due to some edge cases not yet detectable, so we dont need to be shooting for 100%.

Killed is **good**, survived is **bad**, timeouts are **fine** (because the test suite didn't falsely say it was a success).

## Linting

```bash
> npm run lint
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
- the configuration from [process.env](#process.env) which is set on build-time
- the configuration from `window.configEnv` which can be set on start-time

### process.env

Gazebo supports [env files](https://create-react-app.dev/docs/adding-custom-environment-variables) by default which become enviornment variables at build-time.

To override enviornment variables when working locally create a `.env.local` file, this file is ignored by git.

You must prepend env variables with `REACT_APP_`.

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

## Impersonation

Below is the old way, this probably still works but I usually impersonate through the [django dashboard with the VPN](https://api.codecov.io/3Iz61TsiAL/codecov_auth/owner/). If this is not working you need to make a [SOCII request](https://codecovio.atlassian.net/jira/software/projects/SOC/boards/7) to be a staff member.

---

It is possible to impersonate other users for debugging purposes if you are a `Codecov Staff User`. Details on how to impersonate users are explained below:

1. Make sure your codecov user is marked as staff. You can do this by checking the `is_staff` column of the User table. If you are not a staff user, reach out to the [#eng-help](https://codecovteam.slack.com/archives/CDMMWG602)
   channel on Slack.
2. Log in to your codecov account.
3. Once logged in, open the inspect panel and navigate to the `Application` tab.
4. Open the cookies section and add a new cookie with the username you want to impersonate:
   4.1. The cookie key should be `staff_user`
   4.2. The cookie value should be the username you want to impersonate
5. Save the cookie and reload the page... you should be impersonating!

**NOTE: Make sure you delete the staff_user cookie after you are done impersonating**
