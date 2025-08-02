import { spawnSync } from "child_process";
import path from "path";
import { ProjectTypeChecker } from "./project_type_checker.js";

export class JavaTestRunner {
    private readonly projectTypeChecker: ProjectTypeChecker;
    private readonly absoluteProjectRoot: string;

    constructor(projectRoot: string) {
        this.absoluteProjectRoot = path.resolve(projectRoot);
        this.projectTypeChecker = new ProjectTypeChecker(this.absoluteProjectRoot);
        if (!this.projectTypeChecker.isMavenProject() && !this.projectTypeChecker.isGradleProject()) {
            throw new Error("Project is not a Maven or a Gradle project");
        }
    }

    public run(testPattern?: string) {
        const compileResult = this.compile();
        if (!compileResult.success) {
            return {
                error: "Compilation failed",
                compileOutput: compileResult.output
            };
        }

        this.runTests(testPattern);
    }

    private compile(): { success: boolean, output: string } {
        let command: string;
        if (this.projectTypeChecker.isMavenProject()) {
            command = `mvn -f ${this.absoluteProjectRoot}/pom.xml compile test-compile`;
        } else if (this.projectTypeChecker.isGradleProject()) {
            command = `gradle --project-dir ${this.absoluteProjectRoot} compileJava compileTestJava`;
        } else {
            throw new Error("Project is not a Maven or a Gradle project");
        }

        return this.runCommand(command);
    }

    private runTests(testPattern?: string) {
        if (this.projectTypeChecker.isMavenProject()) {
            let command = `mvn -f ${this.absoluteProjectRoot}/pom.xml test`;
            if (testPattern) {
                command += ` -Dtest=${testPattern}`;
            }
            this.runCommandWithoutOutput(command);
        } else {
            let command = `gradle --project-dir ${this.absoluteProjectRoot} test`;
            if (testPattern) {
                command += ` --tests ${testPattern}`;
            }
            this.runCommandWithoutOutput(command);
        }
    }

    private runCommandWithoutOutput(command: string): void {
        spawnSync(command, { cwd: this.absoluteProjectRoot, stdio: 'ignore', shell: true });
    }

    private runCommand(command: string): { success: boolean, output: string } {
        const result = spawnSync(command, { cwd: this.absoluteProjectRoot, stdio: "pipe", shell: true });
        return { success: result.status === 0, output: result.stdout?.toString() ?? result.stderr?.toString() ?? "" };
    }
}