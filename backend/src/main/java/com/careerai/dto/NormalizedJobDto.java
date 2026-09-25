package com.careerai.dto;

import com.careerai.entity.EmploymentType;
import com.careerai.entity.ExperienceLevel;
import com.careerai.entity.JobSource;
import com.careerai.entity.RemoteType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class NormalizedJobDto {

    private JobSource source;
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
    private List<String> skills = new ArrayList<>();
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String salaryCurrency = "INR";
    private String salaryPeriod = "NOT_PROVIDED";
    private LocalDateTime postedDate;
    private LocalDateTime deadline;
    private String applicationUrl;
    private RemoteType remoteType = RemoteType.HYBRID;
    private Boolean isActive = true;

    public NormalizedJobDto() {
    }

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

    public String getApplicationUrl() { return applicationUrl; }
    public void setApplicationUrl(String applicationUrl) { this.applicationUrl = applicationUrl; }

    public RemoteType getRemoteType() { return remoteType; }
    public void setRemoteType(RemoteType remoteType) { this.remoteType = remoteType; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
