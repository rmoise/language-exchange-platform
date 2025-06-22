# Search Library Documentation

Quickly search for library documentation using Context7 MCP.

## Description
This command helps you search for and retrieve documentation from Context7's extensive library database. It follows the best practice of always checking Context7 documentation before implementation as specified in the project's CLAUDE.md.

## Usage
Use this command when you need to:
- Look up documentation for a specific library or framework
- Find code examples and best practices
- Get implementation guidance before writing code
- Research APIs and features

## Prompt
I need to search for documentation using Context7. Please:

1. **Resolve Library**: Use `mcp__context7__resolve-library-id` to find the correct Context7-compatible library ID
2. **Fetch Documentation**: Use `mcp__context7__get-library-docs` to retrieve relevant documentation
3. **Provide Summary**: Give me a clear summary with:
   - Selected library and reason for selection
   - Key documentation points relevant to my needs
   - Code examples if available
   - Best practices and important notes

**Library/Technology to search for**: [Ask user to specify]
**Specific topic/feature** (optional): [Ask user if they want to focus on something specific]

## Team Notes
- Always use Context7 before implementation (per project CLAUDE.md)
- Prefer libraries with high trust scores (7-10)
- Choose libraries with good documentation coverage
- For React/Next.js projects, prioritize official documentation sources