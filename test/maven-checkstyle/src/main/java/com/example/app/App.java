package com.example.app;

/**
 * Example application with a line that exceeds the 120 character limit.
 */
public class App {
    public static void main(String[] args) {
        System.out.println("Hello World!");
        
        // This line exceeds 120 characters and will cause a Checkstyle violation
        String veryLongLine = "This is an extremely long line that goes well beyond the 120 character limit that we have set in our Checkstyle configuration. This will definitely trigger a Checkstyle violation when we run the Maven build.";
        
        System.out.println(veryLongLine);
    }
} 