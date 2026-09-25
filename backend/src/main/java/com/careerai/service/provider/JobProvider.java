package com.careerai.service.provider;

import com.careerai.dto.NormalizedJobDto;
import com.careerai.entity.JobSource;
import com.careerai.entity.ProviderStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface JobProvider {

    JobSource getSourceName();

    ProviderStatus getProviderStatus();

    String getStatusMessage();

    List<NormalizedJobDto> fetchJobs();

    boolean isActive();

    LocalDateTime getLastSuccessfulSync();

    String getLastError();

    int getJobCount();
}
