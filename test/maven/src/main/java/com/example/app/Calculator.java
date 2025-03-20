package com.example.app;

import java.util.logging.Logger;
import java.util.logging.Level;

public class Calculator {
    private static final Logger logger = Logger.getLogger(Calculator.class.getName());
    
    public int add(int a, int b) {
        logger.log(Level.INFO, "Adding numbers: {0} + {1}", new Object[]{a, b});
        int result = a + b;
        logger.log(Level.INFO, "Result of addition: {0}", result);
        return result;
    }
    
    public int subtract(int a, int b) {
        logger.log(Level.INFO, "Subtracting numbers: {0} - {1}", new Object[]{a, b});
        int result = a - b;
        logger.log(Level.INFO, "Result of subtraction: {0}", result);
        return result;
    }
} 