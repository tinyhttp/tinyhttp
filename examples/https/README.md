# HTTPS example

Simple HTTPS server using tinyhttp and `https` module.

## Setup

Generate the certificate key:

```sh
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout localhost-privkey.pem -out localhost-cert.pem
```

Install dependencies:

```sh
pnpm install
```

## Run

```sh
node index.js
```

and in another terminal:

```sh
curl https://localhost:3000 -k
```
