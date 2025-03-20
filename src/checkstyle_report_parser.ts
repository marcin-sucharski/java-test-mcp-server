import { XMLParser } from "fast-xml-parser";
import fs from "fs";
import { ProjectTypeChecker } from "./project_type_checker.js";

export interface CheckstyleViolation {
    fileName: string;
    line: number;
    severity: string;
    message: string;
    source: string;
}

export class CheckstyleReportParser {
    private parser: XMLParser;
    private projectTypeChecker: ProjectTypeChecker;

    constructor(private readonly projectRoot: string) {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "",
        });
        this.projectTypeChecker = new ProjectTypeChecker(projectRoot);
    }
    
    private getCheckstyleReportPath(): string {
        return this.projectTypeChecker.getCheckstyleReportPath();
    }

    public parseReport(): CheckstyleViolation[] {
        const reportPath = this.getCheckstyleReportPath();
        
        if (!fs.existsSync(reportPath)) {
            return [];
        }
        
        const reportContent = fs.readFileSync(reportPath, 'utf-8');
        return this.parseReportContent(reportContent);
    }
    
    protected parseReportContent(xmlContent: string): CheckstyleViolation[] {
        try {
            const parsed = this.parser.parse(xmlContent);
            
            if (!parsed.checkstyle || !parsed.checkstyle.file) {
                return [];
            }
            
            const files = Array.isArray(parsed.checkstyle.file) 
                ? parsed.checkstyle.file 
                : [parsed.checkstyle.file];
                
            const violations: CheckstyleViolation[] = [];
            
            for (const file of files) {
                if (!file.error) {
                    continue;
                }
                
                const errors = Array.isArray(file.error) 
                    ? file.error 
                    : [file.error];
                
                for (const error of errors) {
                    violations.push({
                        fileName: file.name,
                        line: parseInt(error.line, 10),
                        severity: error.severity,
                        message: error.message,
                        source: error.source
                    });
                }
            }
            
            return violations;
        } catch (error) {
            console.error(`Error parsing XML file: ${error}`);
            return [];
        }
    }
}
