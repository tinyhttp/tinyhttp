import commitlint from '@commitlint/config-conventional'

export default {
  extends: ['@commitlint/config-conventional'],
  ...commitlint.rules,
  'type-enum': [
    2,
    'always',
    ['fix', 'test', 'tooling', 'refactor', 'revert', 'example', 'docs', 'format', 'feat', 'chore', 'ci']
  ]
}
