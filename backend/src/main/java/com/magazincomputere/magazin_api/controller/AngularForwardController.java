package com.magazincomputere.magazin_api.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class AngularForwardController {
    // Această expresie regulată este un exemplu și s-ar putea să necesite ajustări fine.
    // Scopul este să redirecționeze către index.html pentru rutele Angular,
    // cu excepția celor care încep cu /api, /swagger-ui, /api-docs, /h2-console
    // și a celor care par a fi pentru fișiere statice (conțin un punct).
    @RequestMapping(value = {"/", "/{path:^(?!api|swagger-ui|api-docs|h2-console|.*\\.).*$}/**", "/{path:^(?!api|swagger-ui|api-docs|h2-console|.*\\.).*$}"})
    public String forward() {
        return "forward:/index.html";
    }
}