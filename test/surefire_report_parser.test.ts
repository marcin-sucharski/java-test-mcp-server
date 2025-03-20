import { SurefireReportParser, TestReportEntry } from '../src/surefire_report_parser.js';
import path from 'path';
import { JavaTestRunner } from '../src/java_test_runner.js';

describe('SurefireReportParser', () => {
  describe('Maven project integration test', () => {
    it('should parse Maven surefire reports correctly', () => {
      const projectRoot = path.join(process.cwd(), 'test/maven');
      new JavaTestRunner(projectRoot).run();

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
      expect(testSubtractFail?.failureStackTrace).toBeDefined();
      expect(testSubtractFail?.failureStackTrace).toContain('java.lang.AssertionError');
      expect(testSubtractFail?.failureStackTrace).toContain('at com.example.app.CalculatorTest.testSubtractFail');
      
      const testAddSuccess = results.find(test => 
        test.name === 'testAddSuccess' && 
        test.className === 'com.example.app.CalculatorTest'
      );
      
      expect(testAddSuccess).toBeDefined();
      expect(testAddSuccess?.success).toBe(true);
      expect(testAddSuccess?.failureReason).toBeUndefined();
      expect(testAddSuccess?.failureStackTrace).toBeUndefined();
    });
  });
  
  describe('Gradle project integration test', () => {
    it('should parse Gradle test reports correctly', () => {
      const projectRoot = path.join(process.cwd(), 'test/gradle');
      new JavaTestRunner(projectRoot).run();
      
      const parser = new SurefireReportParser(projectRoot);
      
      const results = parser.parseReports();
      
      expect(results.length).toBeGreaterThan(0);
      
      const calculatorTest = results.find(test => 
        test.className === 'com.example.app.CalculatorTest'
      );
      
      expect(calculatorTest).toBeDefined();

      const testMultiplyFail = results.find(test => 
        test.name === 'testMultiplyFail' && 
        test.className === 'com.example.app.CalculatorTest'
      );
      
      expect(testMultiplyFail).toBeDefined();
      expect(testMultiplyFail?.success).toBe(false);
      expect(testMultiplyFail?.failureReason).toContain('expected:<10> but was:<7>');
      expect(testMultiplyFail?.failureStackTrace).toBeDefined();
      expect(testMultiplyFail?.failureStackTrace).toContain('java.lang.AssertionError');
      expect(testMultiplyFail?.failureStackTrace).toContain('at com.example.app.CalculatorTest.testMultiplyFail');
      
      const testAddSuccess = results.find(test => 
        test.name === 'testAddSuccess' && 
        test.className === 'com.example.app.CalculatorTest'
      );
      
      expect(testAddSuccess).toBeDefined();
      expect(testAddSuccess?.success).toBe(true);
      expect(testAddSuccess?.failureReason).toBeUndefined();
      expect(testAddSuccess?.failureStackTrace).toBeUndefined();
    });
  });
});
