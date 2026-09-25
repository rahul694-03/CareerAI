package com.careerai.dto;

import com.careerai.entity.ProviderStatus;

import java.time.LocalDateTime;

public class ProviderStatusDto {

    private String provider; // INDEED, LINKEDIN, OFFICIAL_COMPANY, PARTNER
    private ProviderStatus status; // ACTIVE, NOT_CONFIGURED, ERROR
    private String statusMessage;
    private LocalDateTime lastSuccessfulSync;
    private String lastError;
    private int jobCount;

    public ProviderStatusDto() {
    }

    public ProviderStatusDto(String provider, ProviderStatus status, String statusMessage,
                             LocalDateTime lastSuccessfulSync, String lastError, int jobCount) {
        this.provider = provider;
        this.status = status;
        this.statusMessage = statusMessage;
        this.lastSuccessfulSync = lastSuccessfulSync;
        this.lastError = lastError;
        this.jobCount = jobCount;
    }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public ProviderStatus getStatus() { return status; }
    public void setStatus(ProviderStatus status) { this.status = status; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public LocalDateTime getLastSuccessfulSync() { return lastSuccessfulSync; }
    public void setLastSuccessfulSync(LocalDateTime lastSuccessfulSync) { this.lastSuccessfulSync = lastSuccessfulSync; }

    public String getLastError() { return lastError; }
    public void setLastError(String lastError) { this.lastError = lastError; }

    public int getJobCount() { return jobCount; }
    public void setJobCount(int jobCount) { this.jobCount = jobCount; }
}
