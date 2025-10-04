package com.example.backend.mapper;

import com.example.backend.dto.request.VehicleRequest;
import com.example.backend.dto.response.VehicleResponse;
import com.example.backend.entity.Vehicle;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VehicleMapper {
    Vehicle toVehicle(VehicleRequest vehicleRequest);
    VehicleResponse toVehicleResponse(Vehicle vehicle);
}
