package com.boricori;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
public class BoricoriApplication {

	public static void main(String[] args) {
		System.setProperty("GOOGLE_APPLICATION_CREDENTIALS", "C:\\SSAFYgit\\iam-secure\\ssafy-429607-7d5fa6348144.json");
		SpringApplication.run(BoricoriApplication.class, args);
	}

}
