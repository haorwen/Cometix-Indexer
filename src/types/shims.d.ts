declare module "@modelcontextprotocol/sdk/server" {
  export const Server: any;
}
declare module "@modelcontextprotocol/sdk/server/stdio" {
  export const StdioServerTransport: any;
}
declare module "@modelcontextprotocol/sdk/types" {
  export const ListToolsRequestSchema: any;
  export const ListToolsResultSchema: any;
  export const CallToolRequestSchema: any;
  export const CompatibilityCallToolResultSchema: any;
}

declare module "picomatch" {
  const m: any;
  export default m;
}

