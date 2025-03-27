import { spawnSync } from "child_process";
import { ProjectTypeChecker } from "./project_type_checker.js";

export class JavaTestRunner {
    private readonly projectTypeChecker: ProjectTypeChecker;

    constructor(private readonly projectRoot: string) {
        this.projectTypeChecker = new ProjectTypeChecker(projectRoot);
        if (!this.projectTypeChecker.isMavenProject() && !this.projectTypeChecker.isGradleProject()) {
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
        if (this.projectTypeChecker.isMavenProject()) {
            command = `mvn -f ${this.projectRoot}/pom.xml compile test-compile`;
        } else if (this.projectTypeChecker.isGradleProject()) {
            command = `gradle --project-dir ${this.projectRoot} compileJava compileTestJava`;
        } else {
            throw new Error("Project is not a Maven or a Gradle project");
        }

        return this.runCommand(command);
    }

    private runTests() {
        if (this.projectTypeChecker.isMavenProject()) {
            this.runCommandWithoutOutput('mvn test');
        } else {
            this.runCommandWithoutOutput('gradle test');
        }
    }

    private runCommandWithoutOutput(command: string): void {
        spawnSync(command, { cwd: this.projectRoot, stdio: 'ignore', shell: true });
    }

    private runCommand(command: string): { success: boolean, output: string } {
        const result = spawnSync(command, { cwd: this.projectRoot, stdio: "pipe", shell: true });
        return { success: result.status === 0, output: result.stdout?.toString() ?? result.stderr?.toString() ?? "" };
    }
}