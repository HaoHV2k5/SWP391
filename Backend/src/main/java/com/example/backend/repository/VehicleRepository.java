package com.example.backend.repository;

import com.example.backend.entity.Battery;
import com.example.backend.entity.Product;
import com.example.backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByBrandAndModel(String brand, String model);

    List<Vehicle> findByBrandAndModelAndYearManufactured(String brand, String model, Integer yearManufactured);
    @Query(value = """
    select v.*,
    match(v.model, v.brand)
    against(:keyword in natural language mode) as score
     from vehicles v
   where match(v.model, v.brand)
    against(:keyword in natural language mode)
    order by score desc

""",nativeQuery=true)
    List<Vehicle> searchFullText(@Param("keyword") String keyword);

    List<Vehicle> searchByModel(String model);
    List<Vehicle> searchByBrand(String brand);
}
