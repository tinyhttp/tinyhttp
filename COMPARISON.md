# Comparison

Below there is a table comparing tinyhttp, [Express](https://expressjs.com) and [polka](https://github.com/lukeed/polka).

| criteria                             | tinyhttp          | express v4 | polka   |
| ------------------------------------ | ----------------- | ---------- | ------- |
| Minimum supported Node.js version    | 12.4.0            | 0.10.0     | 6.0.0   |
| Minimum supported ECMAScript version | ES2019            | ES5 (?)    | ES5     |
| `req` / `res` extensions             | ✔️                | ✔️         | ✖️      |
| Test coverage                        | 92%               | 100%       | 100%    |
| Compiled to native ESM               | ✔️                | ✖️         | ✖️      |
| TypeScript support                   | ✔️                | ✖️         | ✖️      |
| Package size (core only)             | 51.5 kB           | 208 kB     | 25.5 kB |
| Built-in middlewares                 | ✖️                | ✔️         | ✖️      |

For the detailed performance report see [benchmarks](benchmark/README.md)
