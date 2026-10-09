import {defineConfig} from "@playwright/test";
export default defineConfig({
 testDir:"./tests",globalTeardown:"./tests/global-teardown.ts",fullyParallel:false,workers:1,timeout:120000,
 expect:{timeout:20000},reporter:[["list"],["html",{open:"never"}]],
 use:{baseURL:"http://localhost:3100",channel:process.env.PLAYWRIGHT_CHANNEL || (process.platform==="win32"?"msedge":undefined),trace:"retain-on-failure",screenshot:"only-on-failure"},
 webServer:[
  {command:"node tests/backend-server.mjs",url:"http://localhost:18080/api/status",timeout:180000,reuseExistingServer:false},
  {command:"node tests/frontend-server.mjs",url:"http://localhost:3100/login",timeout:90000,reuseExistingServer:false}
 ]
});
