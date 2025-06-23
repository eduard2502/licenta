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
                // -- START: SPECIFIC RULES (MUST BE FIRST) --

                // Permit all access to swagger, h2-console, auth, products, categories, etc.
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/api-docs/**", "/h2-console/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/products/**")).permitAll()
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/categories/**")).permitAll()
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/specifications/**")).permitAll()

                // Rules for Cart
                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/cart/**")).hasRole("USER")
                
                // Rules for PayPal
                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/cart/paypal/**")).hasRole("USER")

                // Rules for User Profile
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/users/me")).authenticated()
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/users/me")).authenticated()

                
                // Rules for Products, Categories, Specifications (only Admin can modify)
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/products")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/products/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/api/products/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/categories")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/categories/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/api/categories/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/specifications")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/specifications/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/api/specifications/**")).hasRole("ADMIN")

                // Rules for Orders
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/orders")).hasAnyRole("USER", "ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/orders/my-history")).hasAnyRole("USER", "ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/orders/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/orders/**/status")).hasRole("ADMIN")

                // Rules for Users, Customers and Reports (Admin only)
                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/users/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/customers/**")).hasRole("ADMIN")
                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/reports/**")).hasRole("ADMIN")
                
                // Permit static files for the frontend
                .requestMatchers("/", "/*.html", "/*.js", "/*.css", "/*.ico", "/*.png", "/*.jpg", "/*.webmanifest", "/assets/**").permitAll()

                // Public access to view reviews
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/reviews/product/**")).permitAll()
                // Authenticated users can create/update/delete reviews
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/reviews")).authenticated()
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/reviews/**")).authenticated()
                .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/api/reviews/**")).authenticated()

                // -- END: GENERAL RULE (MUST BE LAST) --
                .anyRequest().authenticated()
            );

        // Required for H2 console
        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    
}