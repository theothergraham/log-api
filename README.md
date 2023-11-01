# Log API

Simple REST API to find matching log lines in various log files.

This was developed and tested on Linux. Given its use of `os.EOL` and `path.sep` it _may_ work on other platforms, but it has not been tested and I am not at all familiar with using nodejs on other platforms so it is entirely possible there are other considerations that I missed.

It was developed and tested using nodejs v21.1.0 and npm 10.2.0. The build environment can be prepared with `npm install` and the service built and run with `npm run start`. There are also scripts for `npm run lint` and `npm run test`.

This is only the second project I've worked on using node or Typescript, and the first built from the ground up, so if I've made some curious choices, they likely come from a place of ignorance.

```
graham@nuc001:~/tmp$ node --version
v21.1.0
graham@nuc001:~/tmp$ npm --version
10.2.0
graham@nuc001:~/tmp$ git clone https://github.com/theothergraham/log-api.git
Cloning into 'log-api'...
remote: Enumerating objects: 115, done.
remote: Counting objects: 100% (115/115), done.
remote: Compressing objects: 100% (82/82), done.
remote: Total 115 (delta 52), reused 89 (delta 26), pack-reused 0
Receiving objects: 100% (115/115), 81.79 KiB | 1.60 MiB/s, done.
Resolving deltas: 100% (52/52), done.
graham@nuc001:~/tmp$ cd log-api
graham@nuc001:~/tmp/log-api$ npm install
npm WARN deprecated @types/dotenv@8.2.0: This is a stub types definition. dotenv provides its own type definitions, so you do not need this installed.

added 532 packages, and audited 533 packages in 3s

74 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
graham@nuc001:~/tmp/log-api$ npm run lint

> logapi@1.0.0 lint
> eslint -c .eslintrc.js --ext .ts src

graham@nuc001:~/tmp/log-api$ npm run test

> logapi@1.0.0 test
> jest --coverage

 PASS  test/LogFilter.test.ts
 PASS  test/LogReader.test.ts
 PASS  test/app.test.ts
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |   95.72 |    75.86 |     100 |   96.26 |
 AppLogger.ts       |   86.66 |       60 |     100 |   86.66 | 19,27
 LogFilter.ts       |     100 |      100 |     100 |     100 |
 LogReader.ts       |      95 |       75 |     100 |   96.49 | 24,83
 LogReaderConfig.ts |     100 |       50 |     100 |     100 | 8-9
 app.ts             |     100 |      100 |     100 |     100 |
--------------------|---------|----------|---------|---------|-------------------

Test Suites: 3 passed, 3 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        4.864 s
Ran all test suites.
graham@nuc001:~/tmp/log-api$ npm run start

> logapi@1.0.0 prestart
> npm run build


> logapi@1.0.0 build
> tsc


> logapi@1.0.0 start
> node .

server started at http://localhost:8080

```
and in another window...
```
0:gmccullough@A-C02CN28JMD6R:~% curl -sS 'http://nuc001.local:8080/log/syslog?regex=CRON&maxCount=4' | jq .
{
  "success": true,
  "results": [
    "Nov  1 08:30:01 nuc001 CRON[37509]: (root) CMD ([ -x /etc/init.d/anacron ] && if [ ! -d /run/systemd/system ]; then /usr/sbin/invoke-rc.d anacron start >/dev/null; fi)",
    "Nov  1 08:17:01 nuc001 CRON[37465]: (root) CMD (   cd / && run-parts --report /etc/cron.hourly)",
    "Nov  1 07:30:01 nuc001 CRON[37277]: (root) CMD ([ -x /etc/init.d/anacron ] && if [ ! -d /run/systemd/system ]; then /usr/sbin/invoke-rc.d anacron start >/dev/null; fi)",
    "Nov  1 07:17:01 nuc001 CRON[37240]: (root) CMD (   cd / && run-parts --report /etc/cron.hourly)"
  ]
}
```
