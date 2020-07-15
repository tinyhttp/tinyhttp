import cac from 'cac'
import fs from 'fs/promises'

const cli = cac()

// Configs

const PRETTIER_CONFIG = `
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 180
}
`

const ESLINT_JS_CONFIG = `
{
  "extends": ["eslint:recommended"],
  "plugins": ["prettier"],
  "parserOptions": {
    "ecmaVersion": 2019,
    "sourceType": "module"
  },
  "env": {
    "node": true,
    "es6": true
  }
}
`

const ESLINT_PACKAGES = [
  'eslint',
  'prettier',
  'eslint-plugin-prettier',
  'eslint-config-prettier',
]

const ESLINT_TS_CONFIG = `
{
  "parser": "@typescript-eslint/parser",
  "extends": ["plugin:@typescript-eslint/recommended", "eslint:recommended", "prettier/@typescript-eslint"],
  "plugins": ["prettier"],
  "parserOptions": {
    "ecmaVersion": 2019,
    "sourceType": "module"
  },
  "env": {
    "node": true,
    "es6": true
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
  }
}
`

const ESLINT_TS_PACKAGES = [
  ...ESLINT_PACKAGES,
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
]

const TS_CONFIG_CJS = `
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "CommonJS",
    "preserveSymlinks": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "downlevelIteration": true,
    "noUnusedLocals": false,
    "noImplicitAny": false,
    "noUnusedParameters": true,
    "preserveConstEnums": true,
    "skipLibCheck": true,
    "moduleResolution": "Node",
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true
  },
  "exclude": ["node_modules"]
}
`

const TS_CONFIG_ESM = `
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "ESNext",
    "preserveSymlinks": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "downlevelIteration": true,
    "noUnusedLocals": false,
    "noImplicitAny": false,
    "noUnusedParameters": true,
    "preserveConstEnums": true,
    "skipLibCheck": true,
    "moduleResolution": "Node",
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true
  },
  "exclude": ["node_modules"]
}
`

// Pick package manager. Check the first one in PATH, or specify via flags

type PackageManager = 'pnpm' | 'npm' | 'yarn'

const pathDirs = process.env.PATH.split(':')

const checkPackageManagerInPATH = async (): Promise<PackageManager> => {
  let bins: string[] = []
  let pkgM: PackageManager
  for (const dir of pathDirs) {
    try {
      bins = [...bins, ...(await fs.readdir(dir))]
      // Ignore wrong PATH errors
      // eslint-disable-next-line no-empty
    } catch {}
  }

  for (const bin of bins) {
    if (bin === 'pnpm') {
      pkgM = 'pnpm'
    } else if (bin === 'yarn') {
      pkgM = 'yarn'
    } else if (bin === 'npm') {
      pkgM = 'npm'
    }
  }

  return pkgM
}

checkPackageManagerInPATH().then((pkgM) => {
  let packageManager: PackageManager = pkgM
  let eslintConfig: string

  // shorthands

  cli.option('--pnpm', 'Use pnpm')
  cli.option('--npm', 'Use npm')
  cli.option('--yarn', 'Use yarn')
  cli.option('--ts', 'Use typescript')
  cli.option('--eslint', 'Init ESLint config')
  cli.option('--prettier', 'Init Prettier config')
  cli.option('--esm', 'Use ESM module system')
  cli.option('--cjs', 'Use CommonJS module system')

  const options = cli.parse().options

  const getPackageManagerFromOptions = () => {
    if (options?.pnpm) packageManager = 'pnpm'
    if (options?.yarn) packageManager = 'yarn'
    if (options?.npm) packageManager = 'npm'
  }

  getPackageManagerFromOptions()

  // If using TypeScript, pick ESLint with eslint-typescript integration
})
