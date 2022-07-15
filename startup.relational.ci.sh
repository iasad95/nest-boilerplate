#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh postgres:5432
npm run migration:run
npm run seed:run:relational
npm run start:prod > prod.log 2>&1 &
/opt/wait-for-it.sh localhost:3000
npm run lint
curl -fsS "http://localhost:3000/" > /dev/null
TOKEN=$(curl -fsS -X POST "http://localhost:3000/api/v1/auth/email/login" -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"ChangeMe_BeforeSeeding!"}' | node -e "process.stdin.once('data',(d)=>{const b=JSON.parse(d.toString());if(!b.token){process.exit(1)};process.stdout.write(b.token);});")
curl -fsS "http://localhost:3000/api/v1/auth/me" -H "Authorization: Bearer $TOKEN" > /dev/null
curl -fsS "http://localhost:3000/api/v1/users" -H "Authorization: Bearer $TOKEN" > /dev/null
