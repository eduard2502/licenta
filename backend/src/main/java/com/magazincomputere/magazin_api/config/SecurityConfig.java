package com.magazincomputere.magazin_api.config;

import com.magazincomputere.magazin_api.security.jwt.AuthEntryPointJwt;
import com.magazincomputere.magazin_api.security.jwt.JwtAuthTokenFilter;
import com.magazincomputere.magazin_api.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Permite @PreAuthorize pe metode
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public JwtAuthTokenFilter authenticationJwtTokenFilter() {
        return new JwtAuthTokenFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {}) // Utilizează configurația CORS din WebConfig sau definește una specifică aici
            .csrf(csrf -> csrf.disable()) // Dezactivează CSRF pentru API-uri stateless (comun pentru JWT)
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // API stateless
            .authorizeHttpRequests(auth -> auth
                // Permite request-uri către Swagger/OpenAPI și H2 console fără autentificare
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/api-docs/**", "/h2-console/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll() // Endpoint-urile de autentificare

                // Reguli pentru Produse [cite: 1, 2]
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/products/**")).permitAll()
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/categories/**")).permitAll() // Vizualizare categorii [cite: 1]
                // Admin poate crea, actualiza, șterge produse și categorii
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/products")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/products/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/api/products/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/categories")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/categories/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/api/categories/**")).hasRole("ADMIN")

                // Reguli pentru Specificații [cite: 1]
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/specifications/**")).permitAll() // Toți pot vedea specificațiile
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/specifications")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/specifications/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/api/specifications/**")).hasRole("ADMIN")

                // Reguli pentru Comenzi [cite: 1, 2]
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/orders")).hasAnyRole("USER", "ADMIN") // Finalizare comandă [cite: 2]
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/orders/my-history")).hasAnyRole("USER", "ADMIN") // Istoric comenzi client [cite: 2]
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/orders/**")).hasRole("ADMIN") // Admin vede toate comenzile
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/orders/**/status")).hasRole("ADMIN") // Admin schimbă starea comenzii [cite: 2]

                // Reguli pentru Utilizatori și Clienți (Gestionare Admin) [cite: 1]
                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/users/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/customers/**")).hasRole("ADMIN")

                // Reguli pentru Rapoarte (Admin) [cite: 1]
                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/reports/**")).hasRole("ADMIN")

                // Permite toate celelalte request-uri (pentru frontend-ul Angular)
                .requestMatchers("/", "/*.html", "/*.js", "/*.css", "/*.ico", "/*.png", "/*.jpg", "/*.webmanifest", "/assets/**").permitAll()
                .anyRequest().authenticated() // Orice alt request necesită autentificare
            );

        // Necesar pentru H2 console dacă folosești Spring Security cu frame options
        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}