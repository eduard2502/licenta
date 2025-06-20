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
@EnableMethodSecurity(prePostEnabled = true)
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
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // -- ÎNCEPUT: REGULI SPECIFICE (TREBUIE SĂ FIE PRIMELE) --

                // Permite acces liber la autentificare, produse, categorii etc.
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/api-docs/**", "/h2-console/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/products/**")).permitAll()
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/categories/**")).permitAll()
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/specifications/**")).permitAll()

                // Reguli pentru Coș (Cart)
                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/cart/**")).hasRole("USER")
                // Reguli pentru profil user
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/users/me")).authenticated()
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/users/me")).authenticated()

                
                // Reguli pentru Produse, Categorii, Specificații (doar Admin poate modifica)
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/products")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/products/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/api/products/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/categories")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/categories/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/api/categories/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/specifications")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/specifications/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/api/specifications/**")).hasRole("ADMIN")

                // Reguli pentru Comenzi (Orders)
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/orders")).hasAnyRole("USER", "ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/orders/my-history")).hasAnyRole("USER", "ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/orders/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/orders/**/status")).hasRole("ADMIN")

                // Reguli pentru Utilizatori, Clienți și Rapoarte (doar Admin)
                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/users/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/customers/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/reports/**")).hasRole("ADMIN")
                
                // Permite fișierele statice pentru frontend
                .requestMatchers("/", "/*.html", "/*.js", "/*.css", "/*.ico", "/*.png", "/*.jpg", "/*.webmanifest", "/assets/**").permitAll()

                // Public access to view reviews
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/reviews/product/**")).permitAll()
                // Authenticated users can create/update/delete reviews
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/reviews")).authenticated()
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/reviews/**")).authenticated()
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/api/reviews/**")).authenticated()

                // -- FINAL: REGULA GENERALĂ (TREBUIE SĂ FIE ULTIMA) --
                .anyRequest().authenticated()
            );

        // Necesar pentru H2 console
        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}