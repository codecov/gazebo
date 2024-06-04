import cs from 'classnames'
import { useState } from 'react'

import { CodeSnippet } from 'ui/CodeSnippet'
import { CopyClipboard } from 'ui/CopyClipboard'

const Frameworks = {
  PYTEST: 'Pytest',
  VITEST: 'Vitest',
  JEST: 'Jest',
  PHP_UNIT: 'PHPunit',
} as const

type FrameworkType = (typeof Frameworks)[keyof typeof Frameworks]

const FrameworkCopy = {
  [Frameworks.PYTEST]: 'pytest --cov --junitxml=junit.xml',
  [Frameworks.VITEST]: 'vitest --reporter=junit',
  [Frameworks.JEST]:
    'npm i --save-dev jest-junit \njest --reporters=jest-junit',
  [Frameworks.PHP_UNIT]: './vendor/bin/phpunit --log-junit junit.xml',
} as const

export function FrameworkTabs() {
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType>(
    Frameworks.PYTEST
  )

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex gap-1">
          {Object.keys(FrameworkCopy).map((f) => (
            <button
              key={f}
              className={cs(
                'px-4 py-2',
                selectedFramework === f && 'border-b-2 border-ds-gray-octonary'
              )}
              onClick={() => setSelectedFramework(f as FrameworkType)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <CodeSnippet>
        <div className="flex justify-between">
          {FrameworkCopy[selectedFramework]}
          <CopyClipboard value={FrameworkCopy[selectedFramework]} />
        </div>
      </CodeSnippet>
    </div>
  )
}
