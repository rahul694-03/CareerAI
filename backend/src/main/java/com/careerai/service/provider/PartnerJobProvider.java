package com.careerai.service.provider;

import com.careerai.dto.NormalizedJobDto;
import com.careerai.entity.EmploymentType;
import com.careerai.entity.ExperienceLevel;
import com.careerai.entity.JobSource;
import com.careerai.entity.ProviderStatus;
import com.careerai.entity.RemoteType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class PartnerJobProvider implements JobProvider {

    private static final Logger log = LoggerFactory.getLogger(PartnerJobProvider.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final com.careerai.service.JobClassificationService classificationService;

    private LocalDateTime lastSuccessfulSync;
    private String lastError;
    private int jobCount = 0;

    // Public licensed developer job board feed with open JSON API
    private static final String PARTNER_FEED_URL = "https://www.arbeitnow.com/api/job-board-api";

    public PartnerJobProvider(com.careerai.service.JobClassificationService classificationService) {
        this.classificationService = classificationService;
        this.restClient = RestClient.builder()
                .defaultHeader("User-Agent", "CareerAI-Job-Ingestion/1.0")
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public JobSource getSourceName() {
        return JobSource.PARTNER;
    }

    @Override
    public ProviderStatus getProviderStatus() {
        return ProviderStatus.NOT_CONFIGURED;
    }

    @Override
    public String getStatusMessage() {
        return "Third-party partner aggregators are disabled. Platform strictly uses direct official company ATS portals.";
    }

    @Override
    public List<NormalizedJobDto> fetchJobs() {
        log.info("PartnerJobProvider is disabled to ensure all applications route directly to official company ATS boards.");
        return Collections.emptyList();
    }

    private boolean isIndiaOrRemoteEligible(String location, boolean isRemote) {
        if (isRemote) return true;
        if (location == null) return false;
        String l = location.toLowerCase();
        return l.contains("india") || l.contains("bengaluru") || l.contains("bangalore")
                || l.contains("hyderabad") || l.contains("pune") || l.contains("mumbai")
                || l.contains("delhi") || l.contains("remote");
    }

    @Override
    public boolean isActive() {
        return true;
    }

    @Override
    public LocalDateTime getLastSuccessfulSync() {
        return lastSuccessfulSync;
    }

    @Override
    public String getLastError() {
        return lastError;
    }

    @Override
    public int getJobCount() {
        return jobCount;
    }
}
