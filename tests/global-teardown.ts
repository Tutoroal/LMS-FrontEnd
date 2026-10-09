export default async function globalTeardown(){
 await Promise.allSettled([18081,18082].map(port=>fetch("http://127.0.0.1:"+port+"/shutdown",{method:"POST",headers:{"X-LMS-Test":"fixture"},signal:AbortSignal.timeout(5000)})));
}
