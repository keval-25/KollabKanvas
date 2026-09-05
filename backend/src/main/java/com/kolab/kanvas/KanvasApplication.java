package com.kolab.kanvas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KanvasApplication {

	public static void main(String[] args) {
		SpringApplication.run(KanvasApplication.class, args);
	}

}
