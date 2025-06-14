import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import "dotenv/config";

const mcp = new Client({ name: "smcphub-client", version: "0.0.1" });

const command = "node";
const args = ["./index.js"];

const transportOptions = {
  command: command,
  args: args,
  env: process.env,
};
const transport = new StdioClientTransport(transportOptions);
await mcp.connect(transport);
console.log("Connected to MCP");
const resoucesResult = await mcp.listResources();

console.log(resoucesResult.resources[0].uri);

const resources = await mcp.readResource({uri: resoucesResult.resources[0].uri});
console.log(resources);