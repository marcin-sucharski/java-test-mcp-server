import path from "path";
import fs from "fs";
import { XMLParser } from "fast-xml-parser";
import { ProjectTypeChecker } from "./project_type_checker.js";

export interface TestReportEntry {
    name: string;
    className: string;
    success: boolean;
    failureReason?: string;
}

interface XmlTestCase {
    name: string;
    classname: string;
    failure?: {
        message?: string;
    } | string;
}

export class SurefireReportParser {
    private parser: XMLParser;
    private projectTypeChecker: ProjectTypeChecker;

    constructor(protected readonly projectRoot: string) {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "",
        });
        this.projectTypeChecker = new ProjectTypeChecker(projectRoot);
    }

    public parseReports(): TestReportEntry[] {
        const reportFiles = this.getSurefireReportFiles();
        let allTestCases: TestReportEntry[] = [];
        
        for (const reportFile of reportFiles) {
            const reportPath = path.join(this.getReportDirectory(), reportFile);
            const reportContent = fs.readFileSync(reportPath, 'utf-8');
            const testCases = this.parseReportFile(reportContent);
            allTestCases = [...allTestCases, ...testCases];
        }
        
        return allTestCases;
    }

    protected parseReportFile(xmlContent: string): TestReportEntry[] {
        try {
            const parsed = this.parser.parse(xmlContent);
            
            if (!parsed.testsuite || !parsed.testsuite.testcase) {
                return [];
            }
            
            const testcases = Array.isArray(parsed.testsuite.testcase) 
                ? parsed.testsuite.testcase 
                : [parsed.testsuite.testcase];
            
            return testcases.map((testcase: XmlTestCase) => {
                const hasFailure = !!testcase.failure;
                let failureReason: string | undefined = undefined;
                
                if (hasFailure) {
                    failureReason = testcase.failure && typeof testcase.failure === 'object' && testcase.failure.message 
                        ? testcase.failure.message 
                        : (typeof testcase.failure === 'string' ? testcase.failure : undefined);
                }
                
                return {
                    name: testcase.name,
                    className: testcase.classname,
                    success: !hasFailure,
                    failureReason
                };
            });
        } catch (error) {
            console.error(`Error parsing XML file: ${error}`);
            return [];
        }
    }

    protected getSurefireReportFiles(): string[] {
        const reportDirectory = this.getReportDirectory();
        
        if (!fs.existsSync(reportDirectory)) {
            return [];
        }
        
        return fs.readdirSync(reportDirectory).filter(file => file.endsWith(".xml"));
    }
    
    protected getReportDirectory(): string {
        return this.projectTypeChecker.getTestReportDirectory();
    }
}
