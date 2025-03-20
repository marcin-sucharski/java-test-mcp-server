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
    public void testSubtractFail() {
        Calculator calculator = new Calculator();
        // This test will fail because the expected result is incorrect
        assertEquals(0, calculator.subtract(5, 2));
    }
} 