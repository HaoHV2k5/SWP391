package com.example.backend.repository;

import com.example.backend.entity.Battery;
import com.example.backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatteryRepository extends JpaRepository<Battery, Long> {

    @Query(value = """
    select b.*,
    match(b.model, b.brand)
    against(:keyword in natural language mode) as score
     from batteries b
   where match(b.model, b.brand)
    against(:keyword in natural language mode)
    order by score desc

""",nativeQuery=true)
    List<Battery> searchFullText(@Param("keyword") String keyword);

    List<Battery> searchByModel(String model);
    List<Battery> searchByBrand(String brand);
}
