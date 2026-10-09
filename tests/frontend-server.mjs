import {spawn} from "node:child_process";
import {createServer} from "node:http";
const child=spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p","3100"],{stdio:"inherit",windowsHide:true});
const control=createServer((request,response)=>{
 if(request.method!=="POST"||request.url!=="/shutdown"||request.headers["x-lms-test"]!=="fixture"){response.writeHead(403).end();return;}
 response.end("stopping");
 setTimeout(()=>{child.kill();control.close();},100);
}).listen(18082,"127.0.0.1");
const stop=()=>{child.kill();control.close();};
process.on("SIGINT",stop);process.on("SIGTERM",stop);process.on("exit",()=>child.kill());
child.on("exit",code=>{control.close();process.exit(code||0);});
