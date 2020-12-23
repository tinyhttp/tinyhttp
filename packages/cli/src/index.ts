import cac from 'cac'
import { getBestPkg, PackageManager } from './detectPkg'

const ESLINT_JS_CONFIG = `
{
  "env": {
    "es6": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "plugins": ["prettier"],
  "extends": ["eslint:recommended", "prettier"],
}
`

const ESLINT_TS_CONFIG = `
{
  "parser": "@typescript-eslint/parser",
  "extends": ["plugin:@typescript-eslint/recommended", "eslint:recommended", "prettier/@typescript-eslint"],
  "plugins": ["prettier"],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "env": {
    "node": true,
    "es6": true,
    "jest": true
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "no-unused-vars": "off",
    "no-console": "off",
    "no-undef": "off"
  }
}
`

const PRETTIER_CONFIG = `
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 120,
  "trailingComma": "none",
  "tabWidth": 2
}
`

const TS_CONFIG = (module: 'esm' | 'cjs', pkg: PackageManager) => `
{
  "compilerOptions": {
    "target": "ES2019",
    "module": ${module === 'esm' ? 'ESNext' : 'CommonJS'},
    "preserveSymlinks": ${pkg === 'pnpm' ? 'true' : 'false'},
    "outDir": "dist",
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
  "exclude": ["__tests__", "dist"]
}
`

const cli = cac('tinyhttp')

let pkg: PackageManager

cli.option('--pkg [pkg]', 'Choose package manager')

const { options } = cli.parse()

pkg = await getBestPkg()

if (options) pkg = options.pkg
