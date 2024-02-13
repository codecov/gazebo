import React from 'react'
import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard'

const npmInstall = `npm install @codecov/webpack-plugin --save-dev`
const yarnInstall = `yarn add @codecov/webpack-plugin --dev`
const pnpmInstall = `pnpm add @codecov/webpack-plugin --save-dev`

const pluginConfig = `// webpack.config.js
const path = require("path");
const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");

module.exports = {
  /* ... */
  plugins: [
    // Put the Codecov webpack plugin after all other plugins
    codecovWebpackPlugin({
      enableBundleAnalysis: process.env.NODE_ENV === "production",
      bundleName: "example-webpack-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
};`

const commitString = `git add -A && git commit -m "Added Codecov bundler plugin"`

const npmBuild = `npm run build`
const yarnBuild = `yarn run build`
const pnpmBuild = `pnpm run build`

const StepOne: React.FC = () => {
  return (
    <div className="pt-4">
      <h2 className="pb-2 text-base">
        <span className="font-semibold">Step 1:</span> Install the Codecov
        Webpack Plugin
      </h2>
      <p className="pb-2 text-sm">
        To install the{' '}
        <span className="bg-ds-gray-primary px-1 font-mono">
          @codecov/webpack-plugin
        </span>{' '}
        to your project, use one of the following commands.
      </p>
      <div className="flex flex-col gap-4">
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {npmInstall} <CopyClipboard string={npmInstall} />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {yarnInstall} <CopyClipboard string={yarnInstall} />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {pnpmInstall} <CopyClipboard string={pnpmInstall} />
        </pre>
      </div>
    </div>
  )
}

const StepTwo: React.FC<{ uploadToken: string }> = ({ uploadToken }) => {
  return (
    <div className="pt-4">
      <h2 className="pb-2 text-base">
        <span className="font-semibold">Step 2:</span> Copy Codecov token
      </h2>
      <p className="pb-2 text-sm">
        Set an environment variable in your build environment with the following
        upload token.
      </p>
      <div className="flex flex-col gap-4">
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          CODECOV_TOKEN={uploadToken} <CopyClipboard string={uploadToken} />
        </pre>
      </div>
    </div>
  )
}

const StepThree: React.FC = () => {
  return (
    <div>
      <h2 className="pb-2 text-base">
        <span className="font-semibold">Step 3:</span> Configure the bundler
        plugin
      </h2>
      <p className="pb-2 text-sm">
        Import the bundler plugin, and add it to the end of your plugin array
        found inside your{' '}
        <span className="bg-ds-gray-primary px-1 font-mono">
          webpack.config.js
        </span>{' '}
        file.
      </p>
      <p className="pb-2 text-sm">
        For NextJS users, please see their docs for configuring Webpack inside
        the{' '}
        <span className="bg-ds-gray-primary px-1 font-mono">
          next.config.js
        </span>{' '}
        file{' '}
        <A
          isExternal
          to={{ pageName: 'nextJSCustomConfig' }}
          hook="custom-next-webpack-config"
        >
          here.
        </A>
      </p>
      <pre className="flex items-start justify-between overflow-auto whitespace-pre rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
        {pluginConfig}
        <CopyClipboard string={pluginConfig} />
      </pre>
    </div>
  )
}

const StepFour: React.FC = () => {
  return (
    <div>
      <h2 className="pb-2 text-base">
        <span className="font-semibold">Step 4:</span> Commit your latest
        changes
      </h2>
      <p className="pb-2 text-sm">
        The plugin requires at least one commit to be made to properly upload
        bundle analysis information up to Codecov.
      </p>
      <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
        {commitString} <CopyClipboard string={commitString} />
      </pre>
    </div>
  )
}

const StepFive: React.FC = () => {
  return (
    <div>
      <h2 className="pb-2 text-base">
        <span className="font-semibold">Step 5:</span> Build the application
      </h2>
      <p className="pb-2 text-sm">
        When building your application the plugin will automatically upload the
        stats information to Codecov.
      </p>
      <div className="flex flex-col gap-4">
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {npmBuild} <CopyClipboard string={npmBuild} />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {yarnBuild} <CopyClipboard string={yarnBuild} />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {pnpmBuild} <CopyClipboard string={pnpmBuild} />
        </pre>
      </div>
    </div>
  )
}

interface URLParams {
  provider: string
  owner: string
  repo: string
}

const WebpackOnboarding: React.FC = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoData } = useRepo({ provider, owner, repo })
  const { data: orgUploadToken } = useOrgUploadToken({ provider, owner })

  let uploadToken: string = repoData?.repository?.uploadToken
  if (orgUploadToken) {
    uploadToken = orgUploadToken
  }

  return (
    <div className="flex flex-col gap-6">
      <StepOne />
      <StepTwo uploadToken={uploadToken} />
      <StepThree />
      <StepFour />
      <StepFive />
      <div>
        <p className="border-l-2 border-ds-gray-secondary pl-4">
          <span className="font-semibold">How was your setup experience?</span>{' '}
          Let us know in{' '}
          <A
            to={{ pageName: 'bundleConfigFeedback' }}
            isExternal
            hook="repo-config-feedback"
          >
            this issue
          </A>
        </p>
      </div>
    </div>
  )
}

export default WebpackOnboarding
