import { useState } from 'react'

import { cn } from 'shared/utils/cn'
import { CodeSnippet } from 'ui/CodeSnippet'

const Frameworks = {
  PYTEST: 'Pytest',
  VITEST: 'Vitest',
  JEST: 'Jest',
  PHP_UNIT: 'PHPunit',
} as const

type FrameworkType = (typeof Frameworks)[keyof typeof Frameworks]

const FrameworkCopy = {
  [Frameworks.PYTEST]:
    'pytest --cov --junitxml=junit.xml -o junit_family=legacy',
  [Frameworks.VITEST]: 'vitest --reporter=junit',
  [Frameworks.JEST]: (
    <p data-testid="jest-framework-copy">
      npm i --save-dev jest-junit <br />
      JEST_JUNIT_CLASSNAME=
      <span className="text-codecov-code">{'"{filepath}"'}</span> jest
      --reporters=jest-junit
    </p>
  ),
  [Frameworks.PHP_UNIT]: './vendor/bin/phpunit --log-junit junit.xml',
} as const

const FrameworkClipboard = {
  ...FrameworkCopy,
  [Frameworks.JEST]:
    'npm i --save-dev jest-junit \n JEST_JUNIT_CLASSNAME="{filepath}" jest --reporters=jest-junit',
} as const

export function FrameworkTabs() {
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType>(
    Frameworks.PYTEST
  )

  return (
    <div>
      <div className="flex gap-1">
        {Object.values(Frameworks).map((framework) => (
          <button
            key={framework}
            className={cn(
              'border-b-2 border-transparent px-4 py-2',
              selectedFramework === framework && 'border-ds-gray-octonary'
            )}
            onClick={() => setSelectedFramework(framework)}
          >
            {framework}
          </button>
        ))}
      </div>
      <CodeSnippet clipboard={FrameworkClipboard[selectedFramework]}>
        {FrameworkCopy[selectedFramework]}
      </CodeSnippet>
    </div>
  )
}
