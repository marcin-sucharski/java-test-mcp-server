import path from "path";
import fs from "fs";
import { spawnSync } from "child_process";

class JavaTestRunner {
    constructor(private readonly projectRoot: string) {
        if (!this.isMavenProject() && !this.isGradleProject()) {
            throw new Error("Project is not a Maven or a Gradle project");
        }
    }

    public run() {
        const compileResult = this.compile();
        if (!compileResult.success) {
            return {
                error: "Compilation failed",
                compileOutput: compileResult.output
            };
        }

        this.runTests();
    }

    private compile(): { success: boolean, output: string } {
        let command: string;
        if (this.isMavenProject()) {
            command = 'mvn compile test:compile';
        } else if (this.isGradleProject()) {
            command = 'gradle compileJava compileTestJava';
        } else {
            throw new Error("Project is not a Maven or a Gradle project");
        }

        return this.runCommand(command);
    }

    private runTests() {
        if (this.isMavenProject()) {
            this.runCommandWithoutOutput('mvn test');
        } else {
            this.runCommandWithoutOutput('gradle test');
        }
    }

    private isMavenProject() {
        return fs.existsSync(path.join(this.projectRoot, "pom.xml"));
    }

    private isGradleProject() {
        return fs.existsSync(path.join(this.projectRoot, "build.gradle"))
            || fs.existsSync(path.join(this.projectRoot, "build.gradle.kts"));
    }

    private runCommandWithoutOutput(command: string): void {
        spawnSync(command, { cwd: this.projectRoot, stdio: 'ignore' });
    }

    private runCommand(command: string): { success: boolean, output: string } {
        const result = spawnSync(command, { cwd: this.projectRoot, encoding: 'utf-8' });
        return { success: result.status === 0, output: result.stdout.toString() };
    }
}