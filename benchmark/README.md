# Benchmarks

Using [fastify benchmark tool](https://github.com/talentlessguy/benchmarks)

## Hardware

- Xiaomi Pro 2019 Edition (Laptop)
- CPU: Intel Core i7-8550U
- RAM: 16GB

## System

- kernel: 5.10.15-1
- node: 15.8

## Conditions

- 100 connections
- 10 pipelines
- 40s duration

## Results

| framework                | average req/s | latency |
| ------------------------ | ------------- | ------- |
| tinyhttp@1.2.6           | 34706         | 28.31ms |
| express@4.17.1           | 10836         | 91.68ms |
| koa@2.13.1               | 40504         | 24.18ms |
| fastify@3.12             | 45633         | 21.44ms |
| polka@0.5.2              | 51100         | 19.07ms |
| koa@2.13 + koa-router@10 | 36308         | 27.04ms |

**Conclusion**

- tinyhttp is **2.2x faster** than Express
- polka is 1.47x faster than tinyhttp
