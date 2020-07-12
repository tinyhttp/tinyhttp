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

| framework       | req/s | transfer/sec |
| --------------- | ----- | ------------ |
| tinyhttp@latest | 5149  | 543KB        |
| express@4.17.1  | 5686  | 727KB        |
| polka@0.5.2     | 14500 | 1.49MB       |

## Detailed results

### Node 14.4.0

- tinyhttp@0.1.43

```
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    18.76ms    8.55ms 184.84ms   92.27%
    Req/Sec   658.10    198.17     1.21k    72.20%
  156809 requests in 30.04s, 16.15MB read
Requests/sec:   5220.87
Transfer/sec:    550.64KB
```

- express@4.17.1

```
8 threads and 100 connections
Thread Stats   Avg      Stdev     Max   +/- Stdev
  Latency    17.31ms    8.16ms 192.57ms   93.93%
  Req/Sec   717.38    167.62     1.69k    75.53%
171131 requests in 30.09s, 21.38MB read
Requests/sec:   5686.44
Transfer/sec:    727.46KB
```

- polka@0.5.2

```
  8 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     7.25ms    7.12ms 166.57ms   96.63%
    Req/Sec     1.83k   577.84     4.20k    64.55%
  436415 requests in 30.10s, 44.95MB read
Requests/sec:  14500.76
Transfer/sec:      1.49MB
```
