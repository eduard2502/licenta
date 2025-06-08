// src/main/java/com/magazincomputere/magazin_api/repository/OrderRepository.java
package com.magazincomputere.magazin_api.repository;

import com.magazincomputere.magazin_api.model.Order;
import com.magazincomputere.magazin_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Găsește toate comenzile pentru un utilizator specific, ordonate descrescător după data comenzii.
     * @param user Utilizatorul pentru care se caută comenzile.
     * @return O listă de comenzi.
     */
    List<Order> findByUserOrderByOrderDateDesc(User user);

    /**
     * Găsește toate comenzile cu un anumit status, ordonate descrescător după data comenzii.
     * @param status Statusul comenzii.
     * @return O listă de comenzi.
     */
    List<Order> findByStatusOrderByOrderDateDesc(String status);

    /**
     * Găsește toate comenzile, ordonate descrescător după data comenzii.
     * @return O listă cu toate comenzile ordonate.
     */
    List<Order> findAllByOrderByOrderDateDesc();

    // Poți adăuga și alte metode custom de interogare aici dacă este necesar.
}
