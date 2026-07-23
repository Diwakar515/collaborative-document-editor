package com.docs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class DocsBackendApplication  {

    public static void main(String[] args) {
        SpringApplication.run(DocsBackendApplication.class, args);
    }

}
