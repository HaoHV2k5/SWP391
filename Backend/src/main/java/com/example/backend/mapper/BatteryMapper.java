package com.example.backend.mapper;

import com.example.backend.dto.request.BatteryRequest;
import com.example.backend.dto.response.BatteryResponse;
import com.example.backend.entity.Battery;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BatteryMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    Battery toBattery(BatteryRequest batteryRequest);
    
    BatteryResponse toBatteryResponse(Battery battery);
}
