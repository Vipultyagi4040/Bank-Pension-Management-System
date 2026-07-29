import { spawn } from "node:child_process";

const commands = [
  ["API", ["run", "dev:api"]],
  ["ADMIN", ["run", "dev:admin"]],
  ["PORTAL", ["run", "dev:portal", "--", "--port", "5174"]],
  ["DESKTOP", ["run", "dev:desktop"]]
];
const children = commands.map(([name,args]) => {
  const child=spawn(process.platform === "win32" ? "npm.cmd" : "npm", args, {stdio:"inherit", shell:false});
  child.on("exit", code => console.log(`${name} stopped with code ${code}`));
  return child;
});
function stop(){for(const c of children)c.kill("SIGTERM");process.exit(0)}
process.on("SIGINT",stop);process.on("SIGTERM",stop);
