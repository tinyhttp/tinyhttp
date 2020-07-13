# Benchmarks

## Sample apps

All apps employ two global middlewares with `req` mutations, an empty `GET` route handler for `favicon.ico` and a GET handler for the `/users/:id`, returning a `User: {id}` string response.

## Benchmarking command

`wrk` was used to perform benchmarks.

```sh
# Install on Arch / Manjaro / Artix Linux
yay -S wrk
```

Results are taken after 1 warm-up run. The tool used for results is the following:

```sh
wrk -t8 -c100 -d30s http://localhost:3000/user/123
```

## Information

### Hardware

Xiaomi Laptop with 16GB RAM and Intel Core i7-8550U processor.

### Software

- **OS**: Manjaro Linux
- **Kernel version**: 5.4.44-1-MANJARO

## Results

At the moment, tinyhttp has the worst performance. This will be tried to be fixed during next versions (see [#2](https://github.com/talentlessguy/tinyhttp/issues/2))

### Node 14.4

| framework           | req/s | transfer/sec |
| ------------------- | ----- | ------------ |
| @tinyhttp/app (esm) | 6507  | 686KB        |
| @tinyhttp/app (cjs) | 6177  | 651KB        |
| express@4.17.1      | 7816  | 0.98MB       |
| polka@0.5.2         | 19543 | 2.01MB       |

## Detailed results

### Node 14.4.0

- tinyhttp (esm)

```
 Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    14.90ms    5.74ms 143.05ms   82.66%
    Req/Sec   818.86    248.62     1.58k    75.82%
  195375 requests in 30.02s, 20.12MB read
Requests/sec:   6507.43
Transfer/sec:    686.33KB
```

- tinyhttp (cjs)

```
 8 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    15.82ms    7.18ms 137.36ms   82.31%
    Req/Sec   777.16    297.53     1.71k    73.70%
  185448 requests in 30.02s, 19.10MB read
Requests/sec:   6177.14
Transfer/sec:    651.50KB
```

- express@4.17.1

```
  8 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    12.46ms    4.82ms 136.82ms   93.10%
    Req/Sec     0.98k   182.85     1.21k    72.79%
  234664 requests in 30.02s, 29.32MB read
Requests/sec:   7816.94
Transfer/sec:      0.98MB
```

- polka@0.5.2

```
 Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     5.07ms    3.29ms 119.93ms   97.72%
    Req/Sec     2.46k   435.91     3.15k    78.07%
  586637 requests in 30.02s, 60.42MB read
Requests/sec:  19543.36
Transfer/sec:      2.01MB
```
