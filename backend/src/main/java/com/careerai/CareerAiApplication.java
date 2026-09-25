package com.careerai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CareerAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareerAiApplication.class, args);
    }

}
