# MCP Postgres

Local PostgreSQL Model Context Protocol (MCP) Server. This server provides tools for interacting with a PostgreSQL database, enabling LLMs to list tables, inspect schemas, perform CRUD operations, and run raw SQL queries.

## Features

- **Schema Inspection**: List tables and describe detailed table structures.
- **CRUD Operations**: Secure and parameterized queries for `select`, `insert`, `update`, and `delete` operations.
- **Raw Query Execution**: Ability to execute arbitrary SQL queries when advanced tasks are required.

## Tools

The server registers the following MCP tools:

1. `list_tables`: List tables in a database schema (defaults to `public`).
2. `describe_table`: Show column information and table structure.
3. `select_rows`: Query rows from a table with filters, order, limits, and offsets.
4. `insert_row`: Insert a new row with key-value data.
5. `update_rows`: Update rows matching specific filters.
6. `delete_rows`: Delete rows matching specific filters.
7. `execute_query`: Run a raw SQL query with parameters.

## Setup & Configuration

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL Database

### Installation

Clone the repository and install dependencies:

```bash
cd mcp-postgres
npm install
```

### Environment Variables

Create a `.env` file in the `mcp-postgres` directory using `.env.example` as a template:

```ini
PGHOST=localhost
PGPORT=5432
PGDATABASE=your_database
PGUSER=your_username
PGPASSWORD=your_password
```

### Build and Run

#### Development Mode
To run the server in development mode (with auto-reload):
```bash
npm run dev
```

#### Production Build
To compile the TypeScript project and run the build:
```bash
npm run build
npm start
```

## MCP Configuration

To register this server with an MCP client (such as Claude Desktop), add the following entry to your `mcp_config.json` / `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-postgres-local": {
      "command": "node",
      "args": ["D:/mcp-local/mcp-postgres/dist/index.js"],
      "env": {
        "PGHOST": "localhost",
        "PGPORT": "5432",
        "PGDATABASE": "your_database",
        "PGUSER": "your_username",
        "PGPASSWORD": "your_password"
      }
    }
  }
}
```
*(Make sure to adjust the path to `dist/index.js` according to where the project is placed on your machine)*
