# Benchmarks

## Sample apps

All apps employ two global middlewares with `req` mutations, an empty `GET` route handler for `favicon.ico` and a GET handler for the `/users/:id`, returning a `User: {id}` string response.

## Benchmarking command

Results are taken after one run. The command used for results is the following:

```sh
node run.mjs
```

`run.mjs` is a script that launches a child process with the app and runs benchmarks against it, recursively, going to the next app in the list.

## Information

### Hardware

Xiaomi Laptop with 16GB RAM and Intel Core i7-8550U processor.

### Software

- **OS**: Manjaro Linux
- **Kernel version**: 5.7.19-2-MANJARO
- **Node.js**: 14.9.0

## Results

> **Note**: benchmarks aren't completely accurate and are different on every run and on every machine. You need to compare proportions instead of absolute values.

The table takes average results.

| framework           | req/s | transfer/sec |
| ------------------- | ----- | ------------ |
| @tinyhttp/app (esm) | 8415  | 1.1MB        |
| @tinyhttp/app (cjs) | 8443  | 1.11MB       |
| express@4.17.1      | 2934  | 452KB        |
| polka@0.5.2         | 8634  | 1.13MB       |

**Conclusion**: tinyhttp is ~2.8x faster than Express and and ~1.03x slower than Polka

> **Note**: with Node 14.6.0 and 5.4 kernel there were 5-30Kreq/s for all of the benchmarks and now it's much lower

## Detailed results

- tinyhttp (esm)

```
┌─────────┬──────┬───────┬───────┬───────┬──────────┬─────────┬───────────┐
│ Stat    │ 2.5% │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev   │ Max       │
├─────────┼──────┼───────┼───────┼───────┼──────────┼─────────┼───────────┤
│ Latency │ 7 ms │ 10 ms │ 25 ms │ 40 ms │ 11.27 ms │ 6.82 ms │ 146.76 ms │
└─────────┴──────┴───────┴───────┴───────┴──────────┴─────────┴───────────┘
┌───────────┬────────┬────────┬─────────┬─────────┬────────┬─────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%   │ Avg    │ Stdev   │ Min    │
├───────────┼────────┼────────┼─────────┼─────────┼────────┼─────────┼────────┤
│ Req/Sec   │ 1623   │ 1623   │ 9207    │ 10839   │ 8415.8 │ 2328.52 │ 1623   │
├───────────┼────────┼────────┼─────────┼─────────┼────────┼─────────┼────────┤
│ Bytes/Sec │ 213 kB │ 213 kB │ 1.21 MB │ 1.42 MB │ 1.1 MB │ 305 kB  │ 213 kB │
└───────────┴────────┴────────┴─────────┴─────────┴────────┴─────────┴────────┘

Req/Bytes counts sampled once per second.

126k requests in 15.21s, 16.5 MB read
200 errors (0 timeouts)
```

- tinyhttp (cjs)

```
┌─────────┬──────┬───────┬───────┬───────┬──────────┬─────────┬───────────┐
│ Stat    │ 2.5% │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev   │ Max       │
├─────────┼──────┼───────┼───────┼───────┼──────────┼─────────┼───────────┤
│ Latency │ 7 ms │ 10 ms │ 24 ms │ 31 ms │ 11.25 ms │ 6.47 ms │ 171.45 ms │
└─────────┴──────┴───────┴───────┴───────┴──────────┴─────────┴───────────┘
┌───────────┬────────┬────────┬─────────┬─────────┬─────────┬────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%   │ Avg     │ Stdev  │ Min    │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼────────┼────────┤
│ Req/Sec   │ 2075   │ 2075   │ 9007    │ 11095   │ 8443.54 │ 2235.3 │ 2075   │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼────────┼────────┤
│ Bytes/Sec │ 272 kB │ 272 kB │ 1.18 MB │ 1.45 MB │ 1.11 MB │ 293 kB │ 272 kB │
└───────────┴────────┴────────┴─────────┴─────────┴─────────┴────────┴────────┘

Req/Bytes counts sampled once per second.

127k requests in 15.13s, 16.6 MB read
300 errors (0 timeouts)
```

- express@4.17.1

```
┌─────────┬───────┬───────┬───────┬────────┬──────────┬──────────┬───────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%    │ Avg      │ Stdev    │ Max       │
├─────────┼───────┼───────┼───────┼────────┼──────────┼──────────┼───────────┤
│ Latency │ 20 ms │ 28 ms │ 93 ms │ 121 ms │ 32.89 ms │ 17.69 ms │ 210.29 ms │
└─────────┴───────┴───────┴───────┴────────┴──────────┴──────────┴───────────┘
┌───────────┬─────────┬─────────┬────────┬────────┬────────┬────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%    │ 97.5%  │ Avg    │ Stdev  │ Min     │
├───────────┼─────────┼─────────┼────────┼────────┼────────┼────────┼─────────┤
│ Req/Sec   │ 641     │ 641     │ 3151   │ 3949   │ 2934.4 │ 981.3  │ 641     │
├───────────┼─────────┼─────────┼────────┼────────┼────────┼────────┼─────────┤
│ Bytes/Sec │ 98.8 kB │ 98.8 kB │ 485 kB │ 608 kB │ 452 kB │ 151 kB │ 98.7 kB │
└───────────┴─────────┴─────────┴────────┴────────┴────────┴────────┴─────────┘

Req/Bytes counts sampled once per second.

44k requests in 15.1s, 6.78 MB read
698 errors (0 timeouts)
```

- polka@0.5.2

```
┌─────────┬──────┬───────┬───────┬───────┬──────────┬─────────┬───────────┐
│ Stat    │ 2.5% │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev   │ Max       │
├─────────┼──────┼───────┼───────┼───────┼──────────┼─────────┼───────────┤
│ Latency │ 6 ms │ 10 ms │ 21 ms │ 44 ms │ 11.03 ms │ 6.51 ms │ 120.34 ms │
└─────────┴──────┴───────┴───────┴───────┴──────────┴─────────┴───────────┘
┌───────────┬────────┬────────┬─────────┬─────────┬─────────┬─────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min    │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Req/Sec   │ 1552   │ 1552   │ 8919    │ 11231   │ 8634.54 │ 2044.96 │ 1552   │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Bytes/Sec │ 203 kB │ 203 kB │ 1.17 MB │ 1.47 MB │ 1.13 MB │ 268 kB  │ 203 kB │
└───────────┴────────┴────────┴─────────┴─────────┴─────────┴─────────┴────────┘

Req/Bytes counts sampled once per second.

130k requests in 15.12s, 17 MB read
200 errors (0 timeouts)
```
