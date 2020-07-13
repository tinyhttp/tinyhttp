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
| express@4.17.1  | 7619  | 0.95MB       |
| polka@0.5.2     | 21674 | 2.23MB       |

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
    Latency    12.78ms    5.02ms 142.82ms   92.87%
    Req/Sec     0.96k   183.29     1.21k    71.95%
  228721 requests in 30.02s, 28.57MB read
Requests/sec:   7619.76
Transfer/sec:      0.95MB
```

- polka@0.5.2

```
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     4.61ms    3.38ms 120.73ms   98.07%
    Req/Sec     2.73k   467.45     5.04k    85.77%
  650755 requests in 30.02s, 67.03MB read
Requests/sec:  21674.38
Transfer/sec:      2.23MB
```
