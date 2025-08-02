#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import path from "path";
import { CheckstyleReportParser } from "./checkstyle_report_parser.js";
import { JavaTestRunner } from "./java_test_runner.js";
import { SurefireReportParser, TestReportEntry } from "./surefire_report_parser.js";

async function main() {
    const defaultProjectRoot = process.argv.length > 2 ? process.argv[2] : process.cwd();
    console.error(`Using default project root: ${defaultProjectRoot}`);
    
    const server = new McpServer({
        name: "java-test-mcp-server",
        version: "0.0.7",
    });

    server.tool(
        "run-tests",
        "Compile code, run checks and run tests. Use this tool to run the tests and get test results. "
        + "Upon failure, only failed assertions are reported. "
        + "Successfull tests are not reported. "
        + "To include specific tests always in output (to e.g. check if test has been executed), specify showAlways parameter."
        + "If you want to get the full test output, use the get-test-output tool. "
        + "Use testPattern to run specific tests - examples: 'MyTestClass' (single class), 'com.example.*' (package), "
        + "'**/integration/**' (directory pattern), 'MyTestClass#testMethod' (specific method).",
        {
            projectRoot: z.string().optional().describe("Override project root. If there are multiple projects in the root, specify the subdirectory."),
            showAlways: z.array(z.string()).optional().describe("List of test names (method name in Java) to include in output even upon success"),
            testPattern: z.string().optional().describe("Test pattern to select specific tests to run. Examples: 'MyTestClass', 'com.example.*', '**/integration/**', 'MyTestClass#testMethod' (Maven: -Dtest=pattern, Gradle: --tests pattern)")
        },
        async (params) => {
            try {
                const projectRoot = params.projectRoot || defaultProjectRoot;
                const resolvedProjectRoot = path.resolve(projectRoot);

                const testRunner = new JavaTestRunner(resolvedProjectRoot);
                testRunner.run(params.testPattern);
                
                const reportParser = new SurefireReportParser(resolvedProjectRoot);
                const testResults = reportParser.parseReports();
                
                const checkstyleParser = new CheckstyleReportParser(resolvedProjectRoot);
                const checkstyleViolations = checkstyleParser.parseReport();
                
                const showAlways = params.showAlways || [];
                const testsInReport = testResults.filter(test => !test.success || showAlways.includes(test.name));
                
                if (testsInReport.length === 0 && checkstyleViolations.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "All tests passed successfully."
                            }
                        ]
                    };
                }
                
                let responseText = "";

                if (checkstyleViolations.length > 0) {
                    responseText += "# Checkstyle violations:\n\n";
                    checkstyleViolations.filter(violation => violation.severity === "error").forEach(violation => {
                        responseText += `${violation.fileName}:${violation.line} - ${violation.severity}: ${violation.message}\n`;
                    });
                }
                
                if (testsInReport.length > 0) {
                    responseText += "# Tests results:\n\n";
                    
                    // Group tests by class name
                    const testsByClass = new Map<string, TestReportEntry[]>();
                    testsInReport.forEach(test => {
                        if (!testsByClass.has(test.className)) {
                            testsByClass.set(test.className, []);
                        }
                        testsByClass.get(test.className)!.push(test);
                    });
                    
                    // Display tests grouped by class
                    for (const [className, tests] of testsByClass.entries()) {
                        responseText += `## ${className}\n\n`;
                        
                        tests.forEach(test => {
                            responseText += `### ${test.name}: ${test.success ? 'SUCCESS' : 'FAILED'}\n`;
                            if (!test.success && test.failureReason) {
                                responseText += `Reason: ${test.failureReason}\n`;
                                
                                if (test.failureDetails) {
                                    responseText += `Stack trace: ${test.failureDetails}\n`;
                                }
                            }
                            responseText += "\n";
                        });
                    }
                }
                
                return {
                    content: [
                        {
                            type: "text",
                            text: responseText
                        }
                    ]
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error running tests: ${error.message}`
                        }
                    ]
                };
            }
        }
    );

    server.tool(
        "get-test-output",
        "Get full test stdout output. Use this after run-tests if this output is needed for debugging.",
        {
            projectRoot: z.string().optional().describe("Override project root. If there are multiple projects in the root, specify the subdirectory."),
            className: z.string().describe("Name of the class to get output for"),
            testName: z.string().describe("Name of the test to get output for")
        },
        async (params) => {
            try {
                const projectRoot = params.projectRoot || defaultProjectRoot;
                const resolvedProjectRoot = path.resolve(projectRoot);
                const className = params.className;
                const testName = params.testName;

                const reportParser = new SurefireReportParser(resolvedProjectRoot);
                const testResults = reportParser.parseReports();
                
                const testResult = testResults.find(test => test.name === testName && test.className === className);
                if (!testResult) {
                    const availableTests = testResults.map(test => `${test.className}.${test.name}`).join("\n");
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Test ${testName} in class ${className} not found. Available tests:\n${availableTests}`
                            }
                        ]
                    };
                }
                
                let response = `Test output for ${className}.${testName}:\n`;
                if (testResult.output.stdout) {
                    response += `\nSTDOUT:\n${testResult.output.stdout}`;
                }
                if (testResult.output.stderr) {
                    response += `\nSTDERR:\n${testResult.output.stderr}`;
                }
                if (!testResult.output.stdout && !testResult.output.stderr) {
                    response += "\nNo output.";
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: response
                        }
                    ]
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error getting test output: ${error.message}`
                        }
                    ]
                };
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