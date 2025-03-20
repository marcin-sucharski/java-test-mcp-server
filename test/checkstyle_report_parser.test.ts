import path from 'path';
import { CheckstyleReportParser } from '../src/checkstyle_report_parser.js';
import { JavaTestRunner } from '../src/java_test_runner.js';

describe('CheckstyleReportParser', () => {
  describe('Maven project with checkstyle violations', () => {
    it('should parse Maven checkstyle reports with violations correctly', () => {
      const projectRoot = path.join(process.cwd(), 'test/maven-checkstyle');
      new JavaTestRunner(projectRoot).run();
      
      const parser = new CheckstyleReportParser(projectRoot);
      
      const violations = parser.parseReport();
      
      expect(violations.length).toBeGreaterThan(0);
      
      const lineViolation = violations.find(violation => 
        violation.source === "com.puppycrawl.tools.checkstyle.checks.sizes.LineLengthCheck"
      );
      
      expect(lineViolation).toBeDefined();
      expect(lineViolation?.fileName).toContain('App.java');
      expect(lineViolation?.line).toBe(11);
      expect(lineViolation?.severity).toBe('error');
      expect(lineViolation?.message).toContain('Line is longer than 120 characters');
    });
  });

  describe('Maven project with passing checkstyle', () => {
    it('should report no violations for a compliant project', () => {
      const projectRoot = path.join(process.cwd(), 'test/maven');
      new JavaTestRunner(projectRoot).run();

      const parser = new CheckstyleReportParser(projectRoot);
      
      const violations = parser.parseReport();
      
      expect(violations.length).toBe(0);
    });
  });
}); 