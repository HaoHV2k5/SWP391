package com.example.backend.mapper;

import com.example.backend.dto.request.VehicleRequest;
import com.example.backend.dto.response.VehicleResponse;
import com.example.backend.entity.Vehicle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VehicleMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    Vehicle toVehicle(VehicleRequest vehicleRequest);
    
    VehicleResponse toVehicleResponse(Vehicle vehicle);
    List<VehicleResponse> toVehicleResponseList(List<Vehicle> vehicleList);

}
