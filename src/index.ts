import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { Server } from "@modelcontextprotocol/sdk/server";
import { createMcpServer } from "./server";
import { resolveAuthAndBaseUrlFromCliAndEnv } from "./utils/env";

async function main() {
  const { authToken, baseUrl, logLevel } = resolveAuthAndBaseUrlFromCliAndEnv(process.argv.slice(2));

  const server = new Server({ name: "cometix-indexer", version: "1.0.0" }, {
    capabilities: {
      prompts: {},
      tools: {},
      resources: {},
      sampling: {},
    },
    logging: { level: logLevel },
  });

  await createMcpServer(server, { authToken, baseUrl });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();


