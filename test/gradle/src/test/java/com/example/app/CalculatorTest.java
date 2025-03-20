package com.example.app;

import org.junit.Test;
import static org.junit.Assert.*;

public class CalculatorTest {
    
    @Test
    public void testAddSuccess() {
        Calculator calculator = new Calculator();
        assertEquals(5, calculator.add(2, 3));
    }
    
    @Test
    public void testMultiplyFail() {
        Calculator calculator = new Calculator();
        // This test will fail - there's no multiply method in the Calculator class
        assertEquals(10, calculator.add(5, 2));
    }
} 