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
| @tinyhttp/app (esm) | 6165  | 808KB        |
| @tinyhttp/app (cjs) | 4531  | 594KB        |
| express@4.17.1      | 1260  | 194 kB       |
| polka@0.5.2         | 7952  | 1.04 MB      |

**Conclusion**: tinyhttp is ~5x faster than Express and and ~1.3x slower than Polka

> **Note**: last time we ran the benchmark tinyhttp was 2.5x faster... now it's 5 times faster... wtf

> **Note**: another wtf is that with Node 14.6.0 and 5.4 kernel there were 50-30Kreq/s for all of the benchmarks and now it's much lower

## Detailed results

- tinyhttp (esm)

```
┌─────────┬──────┬───────┬───────┬───────┬──────────┬─────────┬───────────┐
│ Stat    │ 2.5% │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev   │ Max       │
├─────────┼──────┼───────┼───────┼───────┼──────────┼─────────┼───────────┤
│ Latency │ 7 ms │ 14 ms │ 36 ms │ 47 ms │ 15.58 ms │ 8.61 ms │ 145.24 ms │
└─────────┴──────┴───────┴───────┴───────┴──────────┴─────────┴───────────┘
┌───────────┬────────┬────────┬────────┬─────────┬────────┬─────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%    │ 97.5%   │ Avg    │ Stdev   │ Min    │
├───────────┼────────┼────────┼────────┼─────────┼────────┼─────────┼────────┤
│ Req/Sec   │ 1741   │ 1741   │ 6111   │ 9023    │ 6165.4 │ 1760.01 │ 1741   │
├───────────┼────────┼────────┼────────┼─────────┼────────┼─────────┼────────┤
│ Bytes/Sec │ 228 kB │ 228 kB │ 801 kB │ 1.18 MB │ 808 kB │ 231 kB  │ 228 kB │
└───────────┴────────┴────────┴────────┴─────────┴────────┴─────────┴────────┘

Req/Bytes counts sampled once per second.

92k requests in 15.29s, 12.1 MB read
200 errors (0 timeouts)
```

- tinyhttp (cjs)

```
┌─────────┬──────┬───────┬───────┬───────┬──────────┬──────────┬───────────┐
│ Stat    │ 2.5% │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev    │ Max       │
├─────────┼──────┼───────┼───────┼───────┼──────────┼──────────┼───────────┤
│ Latency │ 9 ms │ 17 ms │ 62 ms │ 76 ms │ 21.29 ms │ 17.93 ms │ 334.75 ms │
└─────────┴──────┴───────┴───────┴───────┴──────────┴──────────┴───────────┘
┌───────────┬─────────┬─────────┬────────┬────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%    │ 97.5%  │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼────────┼────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 485     │ 485     │ 4727   │ 7195   │ 4531.94 │ 1803.21 │ 485     │
├───────────┼─────────┼─────────┼────────┼────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 63.6 kB │ 63.6 kB │ 619 kB │ 943 kB │ 594 kB  │ 236 kB  │ 63.5 kB │
└───────────┴─────────┴─────────┴────────┴────────┴─────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.

68k requests in 15.33s, 8.9 MB read
200 errors (0 timeouts)
```

- express@4.17.1

```
┌─────────┬───────┬───────┬────────┬────────┬──────────┬──────────┬───────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5%  │ 99%    │ Avg      │ Stdev    │ Max       │
├─────────┼───────┼───────┼────────┼────────┼──────────┼──────────┼───────────┤
│ Latency │ 32 ms │ 69 ms │ 162 ms │ 190 ms │ 75.73 ms │ 32.02 ms │ 289.18 ms │
└─────────┴───────┴───────┴────────┴────────┴──────────┴──────────┴───────────┘
┌───────────┬─────────┬─────────┬────────┬────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%    │ 97.5%  │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼────────┼────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 144     │ 144     │ 1379   │ 2191   │ 1260.67 │ 456.42  │ 144     │
├───────────┼─────────┼─────────┼────────┼────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 22.2 kB │ 22.2 kB │ 212 kB │ 338 kB │ 194 kB  │ 70.3 kB │ 22.2 kB │
└───────────┴─────────┴─────────┴────────┴────────┴─────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.

19k requests in 15.26s, 2.91 MB read
493 errors (0 timeouts)
```

- polka@0.5.2

```
┌─────────┬──────┬───────┬───────┬───────┬──────────┬──────────┬───────────┐
│ Stat    │ 2.5% │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev    │ Max       │
├─────────┼──────┼───────┼───────┼───────┼──────────┼──────────┼───────────┤
│ Latency │ 5 ms │ 10 ms │ 34 ms │ 61 ms │ 12.05 ms │ 10.52 ms │ 184.86 ms │
└─────────┴──────┴───────┴───────┴───────┴──────────┴──────────┴───────────┘
┌───────────┬────────┬────────┬─────────┬────────┬─────────┬─────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%  │ Avg     │ Stdev   │ Min    │
├───────────┼────────┼────────┼─────────┼────────┼─────────┼─────────┼────────┤
│ Req/Sec   │ 1192   │ 1192   │ 7715    │ 13719  │ 7952.47 │ 3211.39 │ 1192   │
├───────────┼────────┼────────┼─────────┼────────┼─────────┼─────────┼────────┤
│ Bytes/Sec │ 156 kB │ 156 kB │ 1.01 MB │ 1.8 MB │ 1.04 MB │ 421 kB  │ 156 kB │
└───────────┴────────┴────────┴─────────┴────────┴─────────┴─────────┴────────┘

Req/Bytes counts sampled once per second.

119k requests in 15.22s, 15.6 MB read
100 errors (0 timeouts)
```
