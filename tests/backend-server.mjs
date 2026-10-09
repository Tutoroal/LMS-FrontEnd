import fs from "node:fs";
import {createServer} from "node:http";
import path from "node:path";
import {randomBytes} from "node:crypto";
import {execFileSync,spawn} from "node:child_process";
const root=path.resolve("..");
const runtime=path.join(root,".runtime","e2e");
fs.mkdirSync(runtime,{recursive:true});
const run=fs.mkdtempSync(path.join(runtime,"run-"));
const database=path.join(run,"e2e.db");
const binary=path.join(run,process.platform==="win32"?"backend.exe":"backend");
const env={...process.env,DB_PATH:database,LMS_E2E_DB:database,JWT_SECRET:randomBytes(48).toString("hex"),PORT:"18080",FRONTEND_ORIGIN:"http://localhost:3100",AUTO_BACKUP:"false",GIN_MODE:"release"};
const options={cwd:path.join(root,"lms-backend"),env,stdio:"inherit",windowsHide:true};
execFileSync("go",["test","-run","^TestSeedBrowserFixture$","-count=1"],options);
execFileSync("go",["build","-o",binary,"."],options);
const server=spawn(binary,[],options);
const control=createServer((request,response)=>{
 if(request.method!=="POST"||request.url!=="/shutdown"||request.headers["x-lms-test"]!=="fixture"){response.writeHead(403).end();return;}
 response.end("stopping");setTimeout(()=>{server.kill();control.close();},100);
}).listen(18081,"127.0.0.1");
const stop=()=>{if(server.exitCode===null)server.kill();control.close();};
process.on("SIGINT",stop);process.on("SIGTERM",stop);process.on("exit",stop);
server.on("exit",code=>process.exit(code||0));
