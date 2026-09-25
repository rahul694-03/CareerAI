package com.careerai.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_job_source", columnList = "source"),
    @Index(name = "idx_job_source_id", columnList = "source_job_id"),
    @Index(name = "idx_job_company", columnList = "company"),
    @Index(name = "idx_job_title", columnList = "title"),
    @Index(name = "idx_job_location", columnList = "location"),
    @Index(name = "idx_job_active", columnList = "is_active"),
    @Index(name = "idx_job_posted_date", columnList = "posted_date")
})
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 32)
    private JobSource source = JobSource.OFFICIAL_COMPANY;

    @Column(name = "source_job_id")
    private String sourceJobId;

    @Column(name = "source_url", length = 1024)
    private String sourceUrl;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    @Column(name = "company_logo", length = 1024)
    private String companyLogo;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String location;

    @Column(name = "country", length = 64)
    private String country = "India";

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 32)
    private EmploymentType employmentType = EmploymentType.FULL_TIME;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", length = 32)
    private ExperienceLevel experienceLevel = ExperienceLevel.FRESHER;

    @Column(name = "experience_category", length = 32)
    private String experienceCategory; // FRESHER, SENIOR, MID_LEVEL

    @Column(name = "target_academic_years", length = 255)
    private String targetAcademicYears;

    @Column(name = "target_batches", length = 128)
    private String targetBatches;

    @Column(name = "job_type")
    private String jobType = "Full-time";

    @Column(name = "workplace_type")
    private String workplaceType = "Hybrid";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();

    @Column(name = "salary_min", precision = 12, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 12, scale = 2)
    private BigDecimal salaryMax;

    @Column(name = "salary_currency", length = 10)
    private String salaryCurrency = "INR";

    @Column(name = "salary_period", length = 20)
    private String salaryPeriod = "NOT_PROVIDED"; // MONTHLY, ANNUAL, NOT_PROVIDED

    @Column(name = "posted_date")
    private LocalDateTime postedDate;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "application_url", length = 1024)
    private String applicationUrl;

    @Column(name = "apply_url", length = 1024)
    private String applyUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "remote_type", length = 32)
    private RemoteType remoteType = RemoteType.HYBRID;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "last_fetched_at")
    private LocalDateTime lastFetchedAt;

    @Column(name = "is_multi_source")
    private Boolean isMultiSource = false;

    @Column(name = "other_sources", length = 512)
    private String otherSources;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Job() {
    }

    public Job(Long id, JobSource source, String sourceJobId, String sourceUrl,
               String title, String company, String companyLogo, String description,
               String location, String country, EmploymentType employmentType,
               ExperienceLevel experienceLevel, List<String> skills,
               BigDecimal salaryMin, BigDecimal salaryMax, String salaryCurrency,
               String salaryPeriod, LocalDateTime postedDate, LocalDateTime deadline,
               String applicationUrl, RemoteType remoteType, Boolean isActive,
               LocalDateTime lastFetchedAt, Boolean isMultiSource, String otherSources) {
        this.id = id;
        this.source = source != null ? source : JobSource.OFFICIAL_COMPANY;
        this.sourceJobId = sourceJobId;
        this.sourceUrl = sourceUrl;
        this.title = title;
        this.company = company;
        this.companyLogo = companyLogo;
        this.description = description;
        this.location = location;
        this.country = country != null ? country : "India";
        this.employmentType = employmentType != null ? employmentType : EmploymentType.FULL_TIME;
        this.experienceLevel = experienceLevel != null ? experienceLevel : ExperienceLevel.FRESHER;
        this.skills = skills != null ? skills : new ArrayList<>();
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        this.salaryCurrency = salaryCurrency;
        this.salaryPeriod = salaryPeriod;
        this.postedDate = postedDate != null ? postedDate : LocalDateTime.now();
        this.deadline = deadline;
        this.applicationUrl = applicationUrl;
        this.remoteType = remoteType != null ? remoteType : RemoteType.HYBRID;
        this.isActive = isActive != null ? isActive : true;
        this.lastFetchedAt = lastFetchedAt != null ? lastFetchedAt : LocalDateTime.now();
        this.isMultiSource = isMultiSource != null ? isMultiSource : false;
        this.otherSources = otherSources;
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

    public String getExperienceCategory() {
        if (experienceCategory != null && !experienceCategory.trim().isEmpty()) {
            return experienceCategory;
        }
        if (experienceLevel == ExperienceLevel.FRESHER || employmentType == EmploymentType.INTERNSHIP) {
            return "FRESHER";
        }
        if (experienceLevel == ExperienceLevel.SENIOR || experienceLevel == ExperienceLevel.EXECUTIVE) {
            return "SENIOR";
        }
        return "MID_LEVEL";
    }
    public String getResolvedExperienceCategory() {
        return getExperienceCategory();
    }
    public void setExperienceCategory(String experienceCategory) { this.experienceCategory = experienceCategory; }

    public String getTargetAcademicYears() { return targetAcademicYears; }
    public void setTargetAcademicYears(String targetAcademicYears) { this.targetAcademicYears = targetAcademicYears; }

    public String getTargetBatches() { return targetBatches; }
    public void setTargetBatches(String targetBatches) { this.targetBatches = targetBatches; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public BigDecimal getSalaryMin() { return salaryMin; }
    public void setSalaryMin(BigDecimal salaryMin) { this.salaryMin = salaryMin; }

    public BigDecimal getSalaryMax() { return salaryMax; }
    public void setSalaryMax(BigDecimal salaryMax) { this.salaryMax = salaryMax; }

    public String getSalaryCurrency() { return salaryCurrency; }
    public void setSalaryCurrency(String salaryCurrency) { this.salaryCurrency = salaryCurrency; }

    public String getSalaryPeriod() { return salaryPeriod; }
    public void setSalaryPeriod(String salaryPeriod) { this.salaryPeriod = salaryPeriod; }

    public LocalDateTime getPostedDate() { return postedDate; }
    public void setPostedDate(LocalDateTime postedDate) { this.postedDate = postedDate; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public String getApplicationUrl() {
        return applicationUrl != null ? applicationUrl : applyUrl;
    }
    public void setApplicationUrl(String applicationUrl) {
        this.applicationUrl = applicationUrl;
        this.applyUrl = applicationUrl;
    }

    public RemoteType getRemoteType() { return remoteType; }
    public void setRemoteType(RemoteType remoteType) { this.remoteType = remoteType; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getLastFetchedAt() { return lastFetchedAt; }
    public void setLastFetchedAt(LocalDateTime lastFetchedAt) { this.lastFetchedAt = lastFetchedAt; }

    public Boolean getIsMultiSource() { return isMultiSource; }
    public void setIsMultiSource(Boolean isMultiSource) { this.isMultiSource = isMultiSource; }

    public String getOtherSources() { return otherSources; }
    public void setOtherSources(String otherSources) { this.otherSources = otherSources; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Backward-compatibility accessors
    public String getApplyUrl() {
        return applicationUrl != null ? applicationUrl : applyUrl;
    }
    public void setApplyUrl(String applyUrl) {
        this.applyUrl = applyUrl;
        this.applicationUrl = applyUrl;
    }

    public List<String> getRequiredSkills() { return skills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.skills = requiredSkills; }

    @PrePersist
    @PreUpdate
    public void syncLegacyFields() {
        if (this.employmentType == EmploymentType.INTERNSHIP) {
            this.jobType = "Internship";
        } else if (this.experienceLevel == ExperienceLevel.FRESHER) {
            this.jobType = "Fresher";
        } else {
            this.jobType = "Full-time";
        }

        if (this.remoteType == RemoteType.REMOTE) {
            this.workplaceType = "Remote";
        } else if (this.remoteType == RemoteType.HYBRID) {
            this.workplaceType = "Hybrid";
        } else {
            this.workplaceType = "On-site";
        }

        if (this.applyUrl == null && this.applicationUrl != null) {
            this.applyUrl = this.applicationUrl;
        }
        if (this.applicationUrl == null && this.applyUrl != null) {
            this.applicationUrl = this.applyUrl;
        }
    }

    public String getJobType() {
        if (jobType != null && !jobType.isEmpty()) return jobType;
        if (employmentType == EmploymentType.INTERNSHIP) return "Internship";
        if (experienceLevel == ExperienceLevel.FRESHER) return "Fresher";
        return "Full-time";
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }

    public String getWorkplaceType() {
        if (workplaceType != null && !workplaceType.isEmpty()) return workplaceType;
        if (remoteType == RemoteType.REMOTE) return "Remote";
        if (remoteType == RemoteType.HYBRID) return "Hybrid";
        return "On-site";
    }

    public void setWorkplaceType(String workplaceType) {
        this.workplaceType = workplaceType;
    }

    public String getSalaryRange() {
        if (salaryMin == null && salaryMax == null) return "Not provided";
        String curr = salaryCurrency != null ? salaryCurrency : "₹";
        if ("INR".equalsIgnoreCase(curr)) curr = "₹";
        String period = ("MONTHLY".equalsIgnoreCase(salaryPeriod)) ? "/month" : " LPA";
        if (salaryMin != null && salaryMax != null) {
            return curr + salaryMin.stripTrailingZeros().toPlainString() + " - " + salaryMax.stripTrailingZeros().toPlainString() + period;
        }
        if (salaryMin != null) {
            return "From " + curr + salaryMin.stripTrailingZeros().toPlainString() + period;
        }
        return "Up to " + curr + salaryMax.stripTrailingZeros().toPlainString() + period;
    }
}
