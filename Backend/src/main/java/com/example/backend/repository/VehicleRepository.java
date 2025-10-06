package com.example.backend.repository;

import com.example.backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByBrandAndModel(String brand, String model);

    List<Vehicle> findByBrandAndModelAndYearManufactured(String brand, String model, Integer yearManufactured);

}
