package com.careerai.dto;

import com.careerai.entity.EmploymentType;
import com.careerai.entity.ExperienceLevel;
import com.careerai.entity.JobSource;
import com.careerai.entity.RemoteType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class JobDto {

    private Long id;
    private JobSource source = JobSource.OFFICIAL_COMPANY;
    private String sourceJobId;
    private String sourceUrl;
    private String title;
    private String company;
    private String companyLogo;
    private String description;
    private String location;
    private String country = "India";
    private EmploymentType employmentType = EmploymentType.FULL_TIME;
    private ExperienceLevel experienceLevel = ExperienceLevel.FRESHER;
    private String experienceCategory = "FRESHER"; // FRESHER, SENIOR, MID_LEVEL
    private String targetAcademicYears; // e.g. "3rd Year (Pre-Final), 4th Year (Final Year)"
    private String targetBatches; // e.g. "2026, 2027"
    private String workplaceType = "Hybrid"; // Legacy UI compatibility
    private String jobType = "Full-time"; // Legacy UI compatibility
    private List<String> requiredSkills = new ArrayList<>();
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String salaryCurrency = "INR";
    private String salaryPeriod = "NOT_PROVIDED";
    private String salaryRange = "Not provided";
    private Boolean isActive = true;
    private String applyUrl;
    private LocalDateTime postedDate;
    private LocalDateTime deadline;
    private RemoteType remoteType = RemoteType.HYBRID;
    private LocalDateTime lastFetchedAt;
    private Boolean isMultiSource = false;
    private String otherSources;

    public JobDto() {
    }

    public JobDto(Long id, String title, String company, String location, String workplaceType,
                  String jobType, String description, List<String> requiredSkills,
                  String salaryRange, Boolean isActive, String applyUrl, LocalDateTime postedDate) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.location = location;
        this.workplaceType = workplaceType;
        this.jobType = jobType;
        this.description = description;
        this.requiredSkills = requiredSkills != null ? requiredSkills : new ArrayList<>();
        this.salaryRange = salaryRange;
        this.isActive = isActive;
        this.applyUrl = applyUrl;
        this.postedDate = postedDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public JobSource getSource() { return source; }
    public void setSource(JobSource source) { this.source = source; }

    public String getSourceJobId() { return sourceJobId; }
    public void setSourceJobId(String sourceJobId) { this.sourceJobId = sourceJobId; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public EmploymentType getEmploymentType() { return employmentType; }
    public void setEmploymentType(EmploymentType employmentType) { this.employmentType = employmentType; }

    public ExperienceLevel getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(ExperienceLevel experienceLevel) { this.experienceLevel = experienceLevel; }

    public String getWorkplaceType() { return workplaceType; }
    public void setWorkplaceType(String workplaceType) { this.workplaceType = workplaceType; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public List<String> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }

    public List<String> getSkills() { return requiredSkills; }
    public void setSkills(List<String> skills) { this.requiredSkills = skills; }

    public BigDecimal getSalaryMin() { return salaryMin; }
    public void setSalaryMin(BigDecimal salaryMin) { this.salaryMin = salaryMin; }

    public BigDecimal getSalaryMax() { return salaryMax; }
    public void setSalaryMax(BigDecimal salaryMax) { this.salaryMax = salaryMax; }

    public String getSalaryCurrency() { return salaryCurrency; }
    public void setSalaryCurrency(String salaryCurrency) { this.salaryCurrency = salaryCurrency; }

    public String getSalaryPeriod() { return salaryPeriod; }
    public void setSalaryPeriod(String salaryPeriod) { this.salaryPeriod = salaryPeriod; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getApplyUrl() { return applyUrl; }
    public void setApplyUrl(String applyUrl) { this.applyUrl = applyUrl; }

    public String getApplicationUrl() { return applyUrl; }
    public void setApplicationUrl(String applicationUrl) { this.applyUrl = applicationUrl; }

    public LocalDateTime getPostedDate() { return postedDate; }
    public void setPostedDate(LocalDateTime postedDate) { this.postedDate = postedDate; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public RemoteType getRemoteType() { return remoteType; }
    public void setRemoteType(RemoteType remoteType) { this.remoteType = remoteType; }

    public LocalDateTime getLastFetchedAt() { return lastFetchedAt; }
    public void setLastFetchedAt(LocalDateTime lastFetchedAt) { this.lastFetchedAt = lastFetchedAt; }

    public Boolean getIsMultiSource() { return isMultiSource; }
    public void setIsMultiSource(Boolean isMultiSource) { this.isMultiSource = isMultiSource; }

    public String getOtherSources() { return otherSources; }
    public void setOtherSources(String otherSources) { this.otherSources = otherSources; }

    public String getExperienceCategory() { return experienceCategory; }
    public void setExperienceCategory(String experienceCategory) { this.experienceCategory = experienceCategory; }

    public String getTargetAcademicYears() { return targetAcademicYears; }
    public void setTargetAcademicYears(String targetAcademicYears) { this.targetAcademicYears = targetAcademicYears; }

    public String getTargetBatches() { return targetBatches; }
    public void setTargetBatches(String targetBatches) { this.targetBatches = targetBatches; }
}
