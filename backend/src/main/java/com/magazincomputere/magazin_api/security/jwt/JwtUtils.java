package com.magazincomputere.magazin_api.security.jwt; // Asigură-te că pachetul e corect

import com.magazincomputere.magazin_api.security.services.UserDetailsImpl;
import io.jsonwebtoken.*; // Importurile principale JJWT
// Nu mai importăm io.jsonwebtoken.security.Keys pentru această versiune veche
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.spec.SecretKeySpec; // Necesar pentru crearea cheii în versiuni mai vechi
import java.security.Key; // Interfața Key
import java.util.Base64; // Pentru decodarea cheii dacă e stocată ca Base64
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwtSecret}")
    private String jwtSecretString; // Asigură-te că e un string simplu sau gestionează decodarea Base64 aici

    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;

    // Metodă adaptată pentru crearea cheii cu JJWT 0.11.x
    private Key getSigningKey() {
        // Dacă jwtSecretString este encodat Base64, va trebui să-l decodezi:
        // byte[] keyBytes = Base64.getDecoder().decode(this.jwtSecretString);
        // Altfel, dacă e un string simplu:
        byte[] keyBytes = jwtSecretString.getBytes();
        // Folosește SignatureAlgorithm.HS512.getJcaName() pentru a obține numele algoritmului
        return new SecretKeySpec(keyBytes, SignatureAlgorithm.HS512.getJcaName());
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        return buildToken(userPrincipal.getUsername());
    }

    public String generateTokenFromUsername(String username) {
        return buildToken(username);
    }

    private String buildToken(String subject) {
         return Jwts.builder()
                 .setSubject(subject)
                 .setIssuedAt(new Date())
                 .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                 .signWith(SignatureAlgorithm.HS512, getSigningKey()) // Sintaxa pentru 0.11.x
                 .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        // Sintaxa pentru 0.11.x - FĂRĂ parserBuilder()
        return Jwts.parser()
                   .setSigningKey(getSigningKey())
                   .parseClaimsJws(token)
                   .getBody()
                   .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            // Sintaxa pentru 0.11.x - FĂRĂ parserBuilder()
            Jwts.parser().setSigningKey(getSigningKey()).parseClaimsJws(authToken);
            return true;
        } catch (io.jsonwebtoken.SignatureException e) { // Folosește io.jsonwebtoken.SignatureException
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    public String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}