# MCP Local Servers

A collection of local Model Context Protocol (MCP) servers to extend LLM capabilities with local tools.

## Projects in this Repository

Currently, this repository contains:

### 1. [mcp-postgres](file:///D:/mcp-local/mcp-postgres)
A Node.js/TypeScript-based MCP server providing tools to interface with a local PostgreSQL database, enabling schema exploration, CRUD operations, and raw query executions.
- **Path**: `./mcp-postgres`
- **Readme**: Check out the [mcp-postgres README](file:///D:/mcp-local/mcp-postgres/README.md) for setup and details.

## How to use MCP Servers

Model Context Protocol (MCP) allows AI models/clients (like Claude Desktop) to connect securely to local tools. 

To use any of these servers, you will need to:
1. Navigate to the subdirectory.
2. Build the project.
3. Reference the server in your MCP client's configuration file (e.g., `mcp_config.json` or `claude_desktop_config.json`).

Refer to individual project folders for setup guides.
