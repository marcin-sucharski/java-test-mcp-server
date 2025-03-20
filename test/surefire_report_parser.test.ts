import { SurefireReportParser, TestReportEntry } from '../src/surefire_report_parser.js';
import path from 'path';

describe('SurefireReportParser', () => {
  describe('Maven project integration test', () => {
    it('should parse Maven surefire reports correctly', () => {
      const projectRoot = path.join(process.cwd(), 'test/maven');
      const parser = new SurefireReportParser(projectRoot);
      
      const results = parser.parseReports();
      
      expect(results.length).toBe(2);
      
      const testSubtractFail = results.find(test => 
        test.name === 'testSubtractFail' && 
        test.className === 'com.example.app.CalculatorTest'
      );
      
      expect(testSubtractFail).toBeDefined();
      expect(testSubtractFail?.success).toBe(false);
      expect(testSubtractFail?.failureReason).toContain('expected:<0> but was:<3>');
      
      const testAddSuccess = results.find(test => 
        test.name === 'testAddSuccess' && 
        test.className === 'com.example.app.CalculatorTest'
      );
      
      expect(testAddSuccess).toBeDefined();
      expect(testAddSuccess?.success).toBe(true);
    });
  });
  
  describe('Gradle project integration test', () => {
    it('should parse Gradle test reports correctly', () => {
      const projectRoot = path.join(process.cwd(), 'test/gradle');
      
      const parser = new SurefireReportParser(projectRoot);
      
      const results = parser.parseReports();
      
      expect(results.length).toBeGreaterThan(0);
      
      const calculatorTest = results.find(test => 
        test.className === 'com.example.app.CalculatorTest'
      );
      
      expect(calculatorTest).toBeDefined();
    });
  });
  
  describe('XML parsing', () => {
    it('should correctly parse test cases with success and failure', () => {
      const parser = new SurefireReportParser('');
      const xmlContent = `
        <?xml version="1.0" encoding="UTF-8"?>
        <testsuite tests="2" name="com.example.TestSuite">
          <testcase name="successTest" classname="com.example.TestClass" time="0.001"/>
          <testcase name="failureTest" classname="com.example.TestClass" time="0.002">
            <failure message="Test failed">Error details</failure>
          </testcase>
        </testsuite>
      `;
      
      const results = (parser as any).parseReportFile(xmlContent);
      
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('successTest');
      expect(results[0].success).toBe(true);
      expect(results[1].name).toBe('failureTest');
      expect(results[1].success).toBe(false);
      expect(results[1].failureReason).toBe('Test failed');
    });
    
    it('should handle empty or invalid XML gracefully', () => {
      const parser = new SurefireReportParser('');
      
      let results = (parser as any).parseReportFile('<?xml version="1.0"?><testsuite></testsuite>');
      expect(results).toEqual([]);
      
      results = (parser as any).parseReportFile('<invalid>');
      expect(results).toEqual([]);
    });
  });
});
