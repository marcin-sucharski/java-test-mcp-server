import path from "path";
import fs from "fs";

class SurefireReportParser {
    constructor(private readonly projectRoot: string) {
    }

    private getSurefireReportFiles(): string[] {
        const reportDirectory = this.getSurefireReportDirectory();
        return fs.readdirSync(reportDirectory).filter(file => file.endsWith(".xml"));
    }
    
    private getSurefireReportDirectory(): string {
        return path.join(this.projectRoot, "target", "surefire-reports");
    }
}
