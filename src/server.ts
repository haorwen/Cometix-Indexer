import { ListToolsRequestSchema, ListToolsResultSchema, CallToolRequestSchema, CompatibilityCallToolResultSchema } from "@modelcontextprotocol/sdk/types";
import { createRepositoryIndexer } from "./services/repositoryIndexer";
import { createCodeSearcher } from "./services/codeSearcher";

export type ServerContext = { authToken: string; baseUrl: string };

export async function createMcpServer(server: any, ctx: ServerContext): Promise<void> {
  const indexer = createRepositoryIndexer(ctx);
  const searcher = createCodeSearcher(ctx, indexer);

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return ListToolsResultSchema.parse({
      tools: [
        {
          name: "index_project",
          description: "Initialize or update project index using minimal-set batching and schedule auto-sync.",
          inputSchema: {
            type: "object",
            properties: {
              workspacePath: { type: "string" },
              verbose: { type: "boolean" },
            },
            required: ["workspacePath"],
          },
        },
        {
          name: "semantic_search",
          description: "Search repository with pre-search sync to ensure freshness.",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string" },
              paths_include_glob: { type: "string" },
              paths_exclude_glob: { type: "string" },
              max_results: { type: "number" },
            },
            required: ["query"],
          },
        },
      ],
    });
  });

  server.setRequestHandler(CallToolRequestSchema, async (req: any) => {
    const { name, arguments: args } = req.params as { name: string; arguments?: Record<string, unknown> };
    if (name === "index_project") {
      const { workspacePath, verbose } = (args || {}) as { workspacePath: string; verbose?: boolean };
      const result = await indexer.indexProject({ workspacePath, verbose: !!verbose });
      return CompatibilityCallToolResultSchema.parse({
        content: [{ type: "text", text: JSON.stringify(result) }],
      });
    }
    if (name === "semantic_search") {
      const { query, paths_include_glob, paths_exclude_glob, max_results } = (args || {}) as {
        query: string; paths_include_glob?: string; paths_exclude_glob?: string; max_results?: number;
      };
      const result = await searcher.search({
        query,
        pathsIncludeGlob: paths_include_glob,
        pathsExcludeGlob: paths_exclude_glob,
        maxResults: (typeof max_results === "number" && max_results > 0) ? max_results : 10,
      });
      return CompatibilityCallToolResultSchema.parse({
        content: [{ type: "text", text: JSON.stringify(result) }],
      });
    }
    return CompatibilityCallToolResultSchema.parse({ content: [{ type: "text", text: "Unknown tool" }], isError: true });
  });
}


