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

const toolsResult = await mcp.listTools();

console.log(toolsResult.tools);

// Call tool
let toolResult = await mcp.callTool({
  name: "list_tables",
  arguments: {
    database: "smcphub",
  },
});

console.log(toolResult);
