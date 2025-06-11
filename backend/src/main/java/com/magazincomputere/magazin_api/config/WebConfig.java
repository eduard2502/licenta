package com.magazincomputere.magazin_api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Se aplică tuturor endpoint-urilor
                // MODIFICARE: Specificăm explicit originea permisă în loc de "*"
                .allowedOrigins("http://localhost:4200", "http://localhost:8080") 
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Metodele HTTP permise
                .allowedHeaders("*") // Permite toate headerele
                .allowCredentials(true); // Permite trimiterea de credentials (cookies, token-uri etc.)
    }
}
