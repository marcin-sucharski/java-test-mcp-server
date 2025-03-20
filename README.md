# Java Test MCP Server

This is a Model Context Protocol (MCP) server that provides tools for running Java tests and retrieving test output.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Usage

Start the server:
```bash
npm start
```

The server provides two tools:

### run-tests
Runs Java tests in the project.

Parameters:
- `projectRoot` (optional): Override project root. If there are multiple projects in the root, specify the subdirectory.
- `showAlways` (optional): Array of test names (method names in Java) to include in output even upon success.

The tool will:
1. Compile code and run the tests
2. Parse Surefire test reports
3. Parse Checkstyle reports
4. Return a formatted report that includes:
   - Checkstyle violations (if any)
   - Failed tests with failure reasons and stack traces
   - Tests specified in `showAlways` parameter, even if they passed

If all tests pass and there are no violations, a simple success message is shown.

### get-test-output
Retrieves the detailed output (stdout/stderr) of a specific test.

Parameters:
- `projectRoot` (optional): Override project root. If there are multiple projects in the root, specify the subdirectory.
- `className` (required): Name of the class to get output for.
- `testName` (required): Name of the test to get output for.

If the specified test is not found, a list of available tests will be returned.
