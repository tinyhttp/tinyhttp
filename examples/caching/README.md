# Caching example

Example of passive caching strategy in tinyhttp using cache-manager.

## Setup

```sh
tinyhttp new caching
```

## Run

```sh
node index.js
```

## Endpoints

- `GET /weather/search?city=NewYork` - Get Weather information for a city. Notice the elapsed time (ms) in the response body after the first request.
