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
$ wrk -t8 -c100 -d30s http://localhost:3000/user/123
```

## Information

### Hardware

MSI Laptop with 8GB RAM and Intel Core i7-4702MQ processor.

### Software

- **OS**: Manjaro Linux
- **Kernel version**: 5.4.44-1-MANJARO

## Results

At the moment, tinyhttp has the worst performance. This will be tried to be fixed during next versions (see [#2](https://github.com/talentlessguy/tinyhttp/issues/2))

### Node 14.4

| framework             | req/s | transfer/sec |
| --------------------- | ----- | ------------ |
| tinyhttp@0.1.42       | 7845  | 827.36KB     |
| express@5.0.0-alpha.8 | 18172 | 2.27MB       |
| express@4.17.1        | 18678 | 2.33MB       |
| polka@0.5.2           | 22472 | 2.31MB       |

### Node 13.14

| framework             | req/s | transfer/sec |
| --------------------- | ----- | ------------ |
| tinyhttp@0.1.42       | 7829  | 825.69KB     |
| express@5.0.0-alpha.8 |       |              |
| express@4.17.1        |       |              |
| polka@0.5.2           |       |              |

## Detailed results

### Node 14.4.0

- tinyhttp@0.1.42

```
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    12.28ms    4.05ms  88.07ms   66.31%
    Req/Sec     0.99k   310.91     1.94k    76.79%
  236105 requests in 30.10s, 24.32MB read
Requests/sec:   7844.57
Transfer/sec:    827.36KB
```

- express@5.0.0-alpha.8

```
Thread Stats   Avg      Stdev     Max   +/- Stdev
  Latency     5.32ms    1.52ms  66.85ms   96.24%
  Req/Sec     2.29k   269.69     3.95k    92.43%
546628 requests in 30.08s, 68.29MB read
Requests/sec:  18172.03
Transfer/sec:      2.27MB
```

- express@4.17.1

```
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     5.18ms    1.40ms  63.30ms   95.42%
    Req/Sec     2.35k   269.49     4.10k    86.06%
  561698 requests in 30.07s, 70.17MB read
Requests/sec:  18679.05
Transfer/sec:      2.33MB
```

- polka@0.5.2

```
Thread Stats   Avg      Stdev     Max   +/- Stdev
  Latency     4.32ms    1.57ms  69.86ms   96.71%
  Req/Sec     2.82k   332.26     3.39k    82.42%
674822 requests in 30.03s, 69.50MB read
Requests/sec:  22471.70
Transfer/sec:      2.31MB
```

## Node 13.14.0

- tinyhttp@0.1.42

```
Thread Stats   Avg      Stdev     Max   +/- Stdev
  Latency    12.29ms    4.04ms  70.96ms   64.07%
  Req/Sec     0.98k   323.70     2.06k    75.29%
235190 requests in 30.04s, 24.22MB read
Requests/sec:   7828.76
Transfer/sec:    825.69KB
```
