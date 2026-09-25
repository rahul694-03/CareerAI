package com.careerai.dto;

import java.time.LocalDateTime;

public class JobApplicationDto {

    private Long id;
    private Long jobId;
    private String jobTitle;
    private String company;
    private String location;
    private String workplaceType;
    private String jobType;
    private String salaryRange;
    private String applyUrl;
    private String platform;
    private String status;
    private LocalDateTime appliedAt;

    public JobApplicationDto() {
    }

    public JobApplicationDto(Long id, Long jobId, String jobTitle, String company, String location,
                             String workplaceType, String jobType, String salaryRange,
                             String applyUrl, String platform, String status, LocalDateTime appliedAt) {
        this.id = id;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.company = company;
        this.location = location;
        this.workplaceType = workplaceType;
        this.jobType = jobType;
        this.salaryRange = salaryRange;
        this.applyUrl = applyUrl;
        this.platform = platform;
        this.status = status;
        this.appliedAt = appliedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWorkplaceType() { return workplaceType; }
    public void setWorkplaceType(String workplaceType) { this.workplaceType = workplaceType; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public String getApplyUrl() { return applyUrl; }
    public void setApplyUrl(String applyUrl) { this.applyUrl = applyUrl; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
}
