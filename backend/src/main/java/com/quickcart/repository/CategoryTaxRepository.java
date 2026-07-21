package com.quickcart.repository;

import com.quickcart.entity.CategoryTax;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryTaxRepository extends JpaRepository<CategoryTax, Long> {
    Optional<CategoryTax> findByCategoryNameIgnoreCase(String categoryName);
}
