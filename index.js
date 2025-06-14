#!/usr/bin/env node

import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import { jsonSchemaToZod } from "json-schema-to-zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

class SmcphubServer {
  constructor() {}

  async init() {
    const mcpServer = new McpServer(
      {
        name: "smcphub-server",
        version: "0.0.24",
      },
      {
        capabilities: {
          roots: {
            listChanged: true,
          },
          resources: {},
          prompts: {},
        },
      }
    );

    // Get all available servers
    const servers = await this.loadAvailableServers();

    if (servers && servers.length > 0) {
      for (const server of servers) {
        // Register the tools
        const tools = server.tools;
        for (const tool of tools) {
          const properties = tool.input_schema.properties || {};
          // Check every item if the default is null
          if (Object.keys(properties).length > 0) {
            for (const key in properties) {
              if (properties[key].default === null) {
                delete properties[key].default;
              }
            }
          }
          let zod_code = jsonSchemaToZod(tool.input_schema);
          // Remove strict() from the zod code
          //zod_code = zod_code.replace(".strict()", "");
          const zodObject = eval(zod_code);
          const inputSchema = zodObject.shape;
          mcpServer.tool(
            tool.name,
            tool.description,
            inputSchema,
            async (args) => {
              const toolResult = await this.callTool(server, tool.name, args);

              return {
                content: toolResult,
              };
            }
          );
        }

        // Register the resources
        const resources = server.resources;
        if (resources) {
          for (const resource of resources) {
            mcpServer.resource(resource.name, resource.uri, async () => {
              const contents = await this.readResource(server, resource);
              return {
                contents,
              };
            });
          }
        }
      }
    }

    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
  }

  getApiEndpoint() {
    let endpoint = "https://www.smcphub.com";
    if (process.env.NODE_ENV === "development") {
      endpoint = "http://localhost:5002";
    }

    return endpoint;
  }

  getAuthHeaders() {
    const api_key = process.env.SMCPHUB_API_KEY;
    return {
      "x-api-key": api_key,
      "x-timestamp": Date.now(),
    };
  }

  /**
   * Get all mcp servers from smcphub server
   * @returns
   */
  async loadAvailableServers() {
    const fetchOptions = {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
    };

    return fetch(this.getApiEndpoint() + "/mcp/service/list", fetchOptions)
      .then((response) => response.json())
      .catch((error) => {
        return [];
      });
  }

  /**
   * Call tool with given args
   *
   * @param {*} service
   * @param {*} name
   * @param {*} args
   * @returns
   */
  async callTool(service, name, args) {
    const {
      id = 0,
      exec_env = "remote",
      package_name = "",
      settings = {},
      parameters = [],
    } = service;
    const service_id = id;

    if (exec_env === "local") {
      if (!this.localMcp) {
        this.localMcp = new Client({
          name: "smcphub-client",
          version: "0.0.22",
        });

        const transport = new StdioClientTransport({
          command: "npx",
          args: ["-y", package_name.replace("@latest", "") + "@latest"].concat(
            parameters
          ),
          env: { ...process.env, ...settings },
        });
        await this.localMcp.connect(transport);
      }

      // Call tool
      return this.localMcp
        .callTool({
          name,
          arguments: args,
        })
        .then((result) => {
          return result.content;
        })
        .catch((e) => {
          return [];
        });
    } else {
      return fetch(this.getApiEndpoint() + "/mcp/tool/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ service_id, name, args }),
      })
        .then((response) => response.json())
        .then((data) => data.data)
        .catch((error) => {
          return [];
        });
    }
  }

  /**
   * Read resource from a service
   * @param {*} service
   * @param {*} resource
   * @returns
   */
  async readResource(service, resource) {
    const {
      id = 0,
      exec_env = "remote",
      package_name = "",
      settings = {},
      parameters = [],
    } = service;
    const service_id = id;

    if (exec_env === "local") {
      if (!this.localMcp) {
        this.localMcp = new Client({
          name: "smcphub-client",
          version: "0.0.22",
        });

        const transport = new StdioClientTransport({
          command: "npx",
          args: ["-y", package_name.replace("@latest", "") + "@latest"].concat(
            parameters
          ),
          env: { ...process.env, ...settings },
        });
        await this.localMcp.connect(transport);
      }

      // Read resource
      return this.localMcp
        .readResource(resource)
        .then((resouce) => {
          return resouce.contents;
        })
        .catch((e) => {
          return [];
        });
    } else {
      return fetch(this.getApiEndpoint() + "/mcp/resource/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ service_id, resource }),
      })
        .then((response) => response.json())
        .then((data) => data.data)
        .catch((error) => {
          return [];
        });
    }
  }
}

const smcphubServer = new SmcphubServer();
await smcphubServer.init();
