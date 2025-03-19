import path from "path";

class CheckstyleReportParser {
    constructor(private readonly projectRoot: string) {
    }
    
    private getCheckstyleReportPath(): string {
        return path.join(this.projectRoot, "target", "checkstyle-result.xml");
    }
}
