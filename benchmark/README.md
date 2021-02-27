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
| tinyhttp@1.1.5           | 34327         | 28.63ms |
| express@4.17.1           | 12070         | 82.27ms |
| koa@2.13                 | 43289         | 22.6ms  |
| fastify@3.9.2            | 53217         | 18.33ms |
| polka@0.5.2              | 54885         | 17.72ms |
| koa@2.13 + koa-router@10 | 37707         | 26.02ms |

**Conclusion**

- tinyhttp is **1.8x faster** than Express
- polka is 1.6x faster than tinyhttp
