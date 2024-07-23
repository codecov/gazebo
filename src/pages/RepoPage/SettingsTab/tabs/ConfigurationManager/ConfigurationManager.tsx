import FeatureGroup from './components/FeatureGroup'
import FeatureItem from './components/FeatureItem/FeatureItem'

function ConfigurationManager() {
  return (
    <div className="flex flex-col gap-6 lg:w-3/4">
      <CoverageConfiguration />
      <TestCoverageConfiguration />
    </div>
  )
}

export default ConfigurationManager

function CoverageConfiguration() {
  const isTeamPlan = true

  return (
    <FeatureGroup title="Coverage">
      <FeatureGroup.UniversalItems>
        <FeatureItem
          name="Coverage reports"
          configured={true}
          docsLink="quickStart"
          getStartedLink="repo"
        >
          Uploading coverage reports and reporting in PR comment
        </FeatureItem>
        <FeatureItem
          name="YAML"
          configured={false}
          docsLink="codecovYaml"
          getStartedLink="repo"
        >
          Customize your reporting preferences
        </FeatureItem>
      </FeatureGroup.UniversalItems>
      <FeatureGroup.ProItems isProPlan={!isTeamPlan}>
        <FeatureItem
          name="Project coverage"
          configured={false}
          hiddenStatus={!isTeamPlan}
          getStartedLink="repo"
        >
          Include project coverage reporting in PR comment
        </FeatureItem>
        <FeatureItem
          name="Flags"
          configured={false}
          hiddenStatus={!isTeamPlan}
          docsLink="flags"
          getStartedLink="repo"
        >
          Organize your coverage data into custom groups
        </FeatureItem>
        <FeatureItem
          name="Components"
          configured={false}
          hiddenStatus={!isTeamPlan}
          docsLink="components"
          getStartedLink="repo"
        >
          Organize your coverage data into custom groups
        </FeatureItem>
      </FeatureGroup.ProItems>
    </FeatureGroup>
  )
}

function TestCoverageConfiguration() {
  const isTeamPlan = false

  return (
    <FeatureGroup title="Coverage">
      <FeatureGroup.UniversalItems>
        <FeatureItem
          name="Coverage reports"
          configured={true}
          docsLink="quickStart"
          getStartedLink="repo"
        >
          Uploading coverage reports and reporting in PR comment
        </FeatureItem>
        <FeatureItem
          name="YAML"
          configured={false}
          docsLink="codecovYaml"
          getStartedLink="repo"
        >
          Customize your reporting preferences
        </FeatureItem>
      </FeatureGroup.UniversalItems>
      <FeatureGroup.ProItems isProPlan={!isTeamPlan}>
        <FeatureItem
          name="Project coverage"
          configured={false}
          hiddenStatus={!isTeamPlan}
          getStartedLink="repo"
        >
          Include project coverage reporting in PR comment
        </FeatureItem>
        <FeatureItem
          name="Flags"
          configured={false}
          hiddenStatus={!isTeamPlan}
          docsLink="flags"
          getStartedLink="repo"
        >
          Organize your coverage data into custom groups
        </FeatureItem>
        <FeatureItem
          name="Components"
          configured={false}
          hiddenStatus={!isTeamPlan}
          docsLink="components"
          getStartedLink="repo"
        >
          Organize your coverage data into custom groups
        </FeatureItem>
      </FeatureGroup.ProItems>
    </FeatureGroup>
  )
}
