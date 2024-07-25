import { useParams } from 'react-router'

import { TierNames } from 'services/tier'

import FeatureGroup from './components/FeatureGroup'
import FeatureItem from './components/FeatureItem/FeatureItem'
import {
  RepositoryConfiguration,
  useRepoConfigurationStatus,
} from './hooks/useRepoConfigurationStatus/useRepoConfigurationStatus'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function ConfigurationManager() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoConfiguration } = useRepoConfigurationStatus({
    provider,
    owner,
    repo,
  })

  return (
    <div className="flex flex-col gap-6 lg:w-3/4">
      <CoverageConfiguration repoConfiguration={repoConfiguration} />
    </div>
  )
}

export default ConfigurationManager

interface CoverageConfigurationProps {
  repoConfiguration: RepositoryConfiguration
}

function CoverageConfiguration({
  repoConfiguration,
}: CoverageConfigurationProps) {
  const coverageEnabled = !!repoConfiguration?.repository?.coverageEnabled
  const isTeamPlan = repoConfiguration?.plan?.tierName === TierNames.TEAM
  const yaml = repoConfiguration?.repository?.yaml
  const hasProjectStatus = !!yaml && yaml.includes('project:')
  const hasFlags = !!repoConfiguration?.repository?.flagsCount
  const hasComponents = !!repoConfiguration?.repository?.componentsCount

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
          Include project coverage reporting in PR comment
        </FeatureItem>
        <FeatureItem
          name="Flags"
          configured={hasFlags}
          hiddenStatus={!coverageEnabled || isTeamPlan}
          docsLink="flags"
          getStartedLink="flags"
        >
          Organize your coverage data into custom groups
        </FeatureItem>
        <FeatureItem
          name="Components"
          configured={hasComponents}
          hiddenStatus={!coverageEnabled || isTeamPlan}
          docsLink="components"
          getStartedLink="components"
        >
          Organize your coverage data into custom groups
        </FeatureItem>
      </FeatureGroup.ProItems>
    </FeatureGroup>
  )
}
