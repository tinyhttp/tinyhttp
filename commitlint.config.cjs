// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultConfig = require('@commitlint/config-conventional')

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    ...defaultConfig.rules,
    'type-enum': [
      2,
      'always',
      ['fix', 'test', 'tooling', 'refactor', 'revert', 'example', 'docs', 'format', 'feat', 'chore']
    ]
  }
}
