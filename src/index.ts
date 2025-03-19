import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

async function main() {
    const server = new McpServer({
        name: "java-test-mcp-server",
        version: "0.0.1",
    });

    server.tool(
        "run-tests",
        "Compile code, run checks and run tests. Use this tool to run the tests and get test results. "
        + "Upon failure, only failed assertions are reported. "
        + "Successfull tests are not reported. "
        + "To include specific tests always in output (to e.g. check if test has been executed), specify showAlways parameter."
        + "If you want to get the full test output, use the get-test-output tool.",
        {
            showAlways: z.array(z.string()).optional().describe("List of test names to include in output even upon success")
        },
        async () => {
            return {
                content: [
                    {
                        type: "text",
                        text: "Running tests..."
                    }
                ]
            }
        }
    );

    server.tool(
        "get-test-output",
        "Get full test stdout output. Use this after run-tests if this output is needed for debugging.",
        {
            testName: z.string().optional().describe("Name of the test to get output for")
        },
        async () => {
            return {
                content: [
                    {
                        type: "text",
                        text: "Test output..."
                    }
                ]
            }
        }
    )

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Java Test MCP Server running on stdio");
}

main().catch((error) => {
    console.error('Error starting server:', error);
    process.exit(1);
}); 