# Comparison

> This section is in progress

Below there is a table comparing `tinyhttp`, `express` and `polka`.

- (?) - not sure

| criteria                             | tinyhttp    | express v4  | polka      |
| ------------------------------------ | ----------- | ----------- | ---------- |
| Minimum supported Node.js version    | 12.4.0      | 0.10.0      | 10.4.0 (?) |
| Minimum supported ECMAScript version | ES2019      | >ES2015 (?) | ES2015     |
| All req / res extensions             | in progress | yes         | no         |
| Tested                               | in progress | yes         | yes        |
| Compiled to native ESM               | yes         | no          | no         |
| TypeScript support                   | yes         | no          | no         |
| Package size (core only)             | 31.8 kB     | 208 kB      | 25.5 kB    |
| Built-in middlewares                 | no          | yes         | no         |
| Requests / second (approx)           | 16332       | 10199       | 34356      |

For more detailed performance report see [benchmarks](benchmark/README.md)
