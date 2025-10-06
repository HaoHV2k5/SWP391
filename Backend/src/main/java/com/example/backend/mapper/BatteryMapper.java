package com.example.backend.mapper;

import com.example.backend.dto.request.BatteryRequest;
import com.example.backend.dto.response.BatteryResponse;
import com.example.backend.entity.Battery;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BatteryMapper {
    Battery toBattery(BatteryRequest batteryRequest);
    BatteryResponse toBatteryResponse(Battery battery);
}
