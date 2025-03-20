import path from "path";
import fs from "fs";

export class ProjectTypeChecker {
    constructor(private readonly projectRoot: string) {}

    public isMavenProject(): boolean {
        return fs.existsSync(path.join(this.projectRoot, "pom.xml"));
    }

    public isGradleProject(): boolean {
        return fs.existsSync(path.join(this.projectRoot, "build.gradle"))
            || fs.existsSync(path.join(this.projectRoot, "build.gradle.kts"));
    }

    public getTestReportDirectory(): string {
        if (this.isMavenProject()) {
            return path.join(this.projectRoot, "target", "surefire-reports");
        } else if (this.isGradleProject()) {
            return path.join(this.projectRoot, "build", "test-results", "test");
        } else {
            throw new Error("Project is not a Maven or a Gradle project");
        }
    }
    
    public getCheckstyleReportPath(): string {
        if (this.isMavenProject()) {
            return path.join(this.projectRoot, "target", "checkstyle-result.xml");
        } else if (this.isGradleProject()) {
            return path.join(this.projectRoot, "build", "reports", "checkstyle", "main.xml");
        } else {
            throw new Error("Project is not a Maven or a Gradle project");
        }
    }
} 