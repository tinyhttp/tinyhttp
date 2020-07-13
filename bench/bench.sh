#!/bin/sh

wrk -t8 -c100 -d30s http://localhost:3000/user/123