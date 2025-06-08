// src/main/java/com/magazincomputere/magazin_api/model/Role.java
package com.magazincomputere.magazin_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode; // << IMPORTĂ ACEASTA
import org.hibernate.type.SqlTypes;           // << IMPORTĂ ACEASTA

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR) // << ADAUGĂ ACEASTĂ ADNOTARE
    @Column(length = 20, unique = true, nullable = false)
    private ERole name;
}
