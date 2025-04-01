package com.a601.moba;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;


@SpringBootApplication
@EnableJpaAuditing
public class MobaApplication {

    public static void main(String[] args) {
        SpringApplication.run(MobaApplication.class, args);
    }

}
