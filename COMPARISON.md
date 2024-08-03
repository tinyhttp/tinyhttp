# Comparison

Below there is a table comparing tinyhttp, [Express](https://expressjs.com) and
[polka](https://github.com/lukeed/polka).

| criteria                             | tinyhttp | express v4 | polka   |
| ------------------------------------ | -------- | ---------- | ------- |
| Minimum supported Node.js version    | 14.21.3  | 0.10.0     | 6.0.0   |
| Minimum supported ECMAScript version | ES2019   | ES5 (?)    | ES5     |
| `req` / `res` extensions             | ✔️       | ✔️         | ✖️      |
| Test coverage                        | 96%      | 100%       | 100%    |
| Compiled to native ESM               | ✔️       | ✖️         | ✖️      |
| TypeScript support                   | ✔️       | ✖️         | ✖️      |
| Package size (core only)             | 76.2kB   | 208 kB     | 25.5 kB |
| Built-in middlewares                 | ✖️       | ✔️         | ✖️      |

For the detailed performance report see
[benchmarks](https://web-frameworks-benchmark.netlify.app/compare?f=polka,tinyhttp,express)
