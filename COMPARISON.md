# Comparison

> This section is in progress

Below there is a table comparing tinyhttp, [Express](https://expressjs.com) and [polka](https://github.com/lukeed/polka).

- (?) - not sure

| criteria                             | tinyhttp    | express v4 | polka   |
| ------------------------------------ | ----------- | ---------- | ------- |
| Minimum supported Node.js version    | 12.4.0      | 0.10.0     | 6.0.0   |
| Minimum supported ECMAScript version | ES2019      | ES5 (?)    | ES5     |
| All req / res extensions             | in progress | yes        | no      |
| Tested                               | in progress | yes        | yes     |
| Compiled to native ESM               | yes         | no         | no      |
| TypeScript support                   | yes         | no         | no      |
| Package size (core only)             | 49.9 kB     | 208 kB     | 25.5 kB |
| Built-in middlewares                 | no          | yes        | no      |
| Req / s (relative, express = 1)      | 2.3x        | 1x         | 2.9x    |

For the more detailed performance report see [benchmarks](benchmark/README.md)
