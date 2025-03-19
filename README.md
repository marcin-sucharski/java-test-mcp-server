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
- `testClass` (optional): The specific test class to run. If not provided, all test classes will be run.

### get-test-output
Retrieves the output of previously run tests.

Parameters:
- `testId` (optional): The ID of the test run to get output for. If not provided, the latest test run output will be returned.

## Development

This is a stub implementation. The actual test running functionality needs to be implemented in the tool handlers. 