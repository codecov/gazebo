import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { useState } from 'react'
import { useParams } from 'react-router'

import { ConfigureCachedBundleModal } from 'pages/RepoPage/shared/ConfigureCachedBundleModal/ConfigureCachedBundleModal'
import Icon from 'ui/Icon'

import FeatureGroup from './components/FeatureGroup'
import FeatureItem from './components/FeatureItem/FeatureItem'
import {
  RepoConfigurationStatusQueryOpts,
  RepositoryConfiguration,
} from './hooks/useRepoConfigurationStatus/RepoConfigurationStatusQueryOpts'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function ConfigurationManager() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoConfiguration } = useSuspenseQueryV5(
    RepoConfigurationStatusQueryOpts({
      provider,
      owner,
      repo,
    })
  )

  return (
    <div className="flex flex-col gap-6 lg:w-3/4">
      <CoverageConfiguration repoConfiguration={repoConfiguration} />
      <BundleAnalysisConfiguration repoConfiguration={repoConfiguration} />
      <TestAnalyticsConfiguration repoConfiguration={repoConfiguration} />
      <IntegrationsList />
    </div>
  )
}

export default ConfigurationManager

interface ConfigurationGroupProps {
  repoConfiguration: RepositoryConfiguration
}

function CoverageConfiguration({ repoConfiguration }: ConfigurationGroupProps) {
  const coverageEnabled = !!repoConfiguration?.repository?.coverageEnabled
  const isTeamPlan = repoConfiguration?.plan?.isTeamPlan
  const yaml = repoConfiguration?.repository?.yaml
  const hasProjectStatus = !!yaml && yaml.includes('project:')
  const hasFlags =
    !!repoConfiguration?.repository?.coverageAnalytics?.flagsCount
  const hasComponents =
    !!repoConfiguration?.repository?.coverageAnalytics?.componentsCount

  return (
    <FeatureGroup
      title="Coverage"
      getStartedLink="repo"
      showGetStartedLink={!coverageEnabled}
    >
      <FeatureGroup.UniversalItems>
        <FeatureItem
          name="Coverage reports"
          configured={coverageEnabled}
          docsLink="quickStart"
          getStartedLink="repo"
          hiddenStatus={!coverageEnabled}
        >
          Uploading coverage reports and reporting in PR comment
        </FeatureItem>
        <FeatureItem
          name="YAML"
          configured={!!yaml}
          docsLink="codecovYaml"
          getStartedLink="codecovYaml"
          hiddenStatus={!coverageEnabled}
        >
          Customize your reporting preferences
        </FeatureItem>
      </FeatureGroup.UniversalItems>
      <FeatureGroup.ProItems isTeamPlan={isTeamPlan}>
        <FeatureItem
          name="Project coverage"
          configured={hasProjectStatus}
          docsLink="statusChecks"
          hiddenStatus={!coverageEnabled || isTeamPlan}
          getStartedLink="statusChecks"
        >
          Include project coverage reporting
        </FeatureItem>
        <FeatureItem
          name="Flags"
          configured={hasFlags}
          hiddenStatus={!coverageEnabled || isTeamPlan}
          docsLink="flags"
          getStartedLink="flags"
        >
          Organize your coverage data by upload
        </FeatureItem>
        <FeatureItem
          name="Components"
          configured={hasComponents}
          hiddenStatus={!coverageEnabled || isTeamPlan}
          docsLink="components"
          getStartedLink="components"
        >
          Organize your coverage data by file paths
        </FeatureItem>
      </FeatureGroup.ProItems>
    </FeatureGroup>
  )
}

function TestAnalyticsConfiguration({
  repoConfiguration,
}: ConfigurationGroupProps) {
  const testAnalyticsEnabled =
    !!repoConfiguration?.repository?.testAnalyticsEnabled

  return (
    <FeatureGroup
      title="Test analytics"
      getStartedLink="failedTestsOnboarding"
      showGetStartedLink={!testAnalyticsEnabled}
    >
      <FeatureGroup.UniversalItems>
        <FeatureItem
          name="Failed tests"
          configured={testAnalyticsEnabled}
          docsLink="testsAnalytics"
          getStartedLink="tests"
          hiddenStatus={!testAnalyticsEnabled}
        >
          Identify and fix consistently failing tests
        </FeatureItem>
      </FeatureGroup.UniversalItems>
    </FeatureGroup>
  )
}

function BundleAnalysisConfiguration({
  repoConfiguration,
}: ConfigurationGroupProps) {
  const [showBundleCachingModal, setShowBundleCachingModal] = useState(false)
  const jsOrTsPresent = !!repoConfiguration?.repository?.languages?.some(
    (lang) =>
      lang.toLowerCase() === 'javascript' || lang.toLowerCase() === 'typescript'
  )

  if (!jsOrTsPresent) {
    return null
  }

  const bundleAnalysisEnabled =
    !!repoConfiguration?.repository?.bundleAnalysisEnabled

  return (
    <FeatureGroup
      title="Bundle analysis"
      getStartedLink="bundleOnboarding"
      showGetStartedLink={!bundleAnalysisEnabled}
    >
      <FeatureGroup.UniversalItems>
        <FeatureItem
          name="Bundle reports"
          configured={bundleAnalysisEnabled}
          docsLink="bundleAnalysisDocs"
          getStartedLink="bundleOnboarding"
          hiddenStatus={!bundleAnalysisEnabled}
        >
          Track, monitor, and manage your bundle
        </FeatureItem>
        <div>
          <button
            onClick={() => setShowBundleCachingModal(true)}
            className="flex items-center gap-0.5 text-xs font-semibold text-ds-blue-darker hover:cursor-pointer hover:underline"
          >
            <Icon name="cog" size="sm" variant="outline" />
            Configure data caching
          </button>
          <ConfigureCachedBundleModal
            isOpen={showBundleCachingModal}
            setIsOpen={setShowBundleCachingModal}
          />
        </div>
      </FeatureGroup.UniversalItems>
    </FeatureGroup>
  )
}

function IntegrationsList() {
  return (
    <FeatureGroup title="Codecov integrations">
      <FeatureGroup.UniversalItems>
        <FeatureItem
          name="VSCode extension"
          hiddenStatus={true}
          nameLink="codecovYamlValidator"
        >
          Enhance your development workflow with Codecov integration directly in
          Visual Studio Code
        </FeatureItem>
        <FeatureItem
          name="Browser extension"
          hiddenStatus={true}
          nameLink="codecovBrowserExtension"
        >
          Access Codecov coverage reports directly in your browser while
          reviewing pull requests
        </FeatureItem>
        <FeatureItem
          name="Slack app"
          hiddenStatus={true}
          nameLink="codecovSlackApp"
        >
          Stay up to date with updates directly in Slack
        </FeatureItem>
      </FeatureGroup.UniversalItems>
    </FeatureGroup>
  )
}
