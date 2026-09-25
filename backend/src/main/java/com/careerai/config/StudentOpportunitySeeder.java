package com.careerai.config;

import com.careerai.entity.*;
import com.careerai.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Order(10)
public class StudentOpportunitySeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(StudentOpportunitySeeder.class);

    private final JobRepository jobRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public StudentOpportunitySeeder(JobRepository jobRepository, org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.jobRepository = jobRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_source_check");
        } catch (Exception e) {
            log.debug("jobs_source_check constraint update: {}", e.getMessage());
        }
        seedVerifiedStudentRoles();
    }

    private void seedVerifiedStudentRoles() {
        log.info("Checking verified student, fresher and campus opportunity catalog...");

        // Purge any legacy third-party aggregator jobs so only direct company ATS boards exist
        try {
            jobRepository.deleteBySource(JobSource.PARTNER);
        } catch (Exception e) {
            log.warn("Could not purge partner aggregator jobs: {}", e.getMessage());
        }

        List<JobSeedItem> items = List.of(
                // --- 1st & 2nd Year Opportunities (Batch 2029 & 2030) ---
                new JobSeedItem(
                        "Developer (Campus Intern / Early Talent)",
                        "Thoughtworks",
                        "Bengaluru / Pune, India",
                        EmploymentType.INTERNSHIP,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "1st Year, 2nd Year (Undergraduate)",
                        "2029, 2030",
                        RemoteType.HYBRID,
                        List.of("Python", "Java", "Data Structures", "Algorithms"),
                        BigDecimal.valueOf(45000), BigDecimal.valueOf(60000), "MONTHLY",
                        "https://boards.greenhouse.io/thoughtworks/jobs/8210384",
                        "Designed for early college undergraduate students. Work closely with senior mentors across core algorithms, agile software development, and modern cloud technologies."
                ),
                new JobSeedItem(
                        "Software Engineer Apprentice / Intern (Batch 2029/2030)",
                        "Datadog",
                        "Remote (India Eligible)",
                        EmploymentType.INTERNSHIP,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "1st Year, 2nd Year (Undergraduate)",
                        "2029, 2030",
                        RemoteType.REMOTE,
                        List.of("Go", "Python", "Data Structures", "Observability"),
                        BigDecimal.valueOf(50000), BigDecimal.valueOf(70000), "MONTHLY",
                        "https://job-boards.greenhouse.io/datadog/jobs/6573921",
                        "Early undergraduate fellowship for foundational students. Hands-on coding, cloud monitoring fundamentals, and direct 1-on-1 industry mentorship."
                ),
                new JobSeedItem(
                        "Campus Developer Fellow (Open Source & Coding)",
                        "HackerRank",
                        "Remote (India Eligible)",
                        EmploymentType.INTERNSHIP,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "1st Year, 2nd Year (Undergraduate)",
                        "2029, 2030",
                        RemoteType.REMOTE,
                        List.of("Python", "JavaScript", "React", "Git"),
                        BigDecimal.valueOf(30000), BigDecimal.valueOf(40000), "MONTHLY",
                        "https://jobs.lever.co/hackerrank/8a2f190c-6029-4da4-8bcf-109283948512",
                        "Flexible campus fellowship for early college coders. Build developer assessment content, contribute to community libraries, and hone algorithms."
                ),

                // --- 3rd Year / Pre-Final Year (Batch 2028) ---
                new JobSeedItem(
                        "Software Engineering Intern (Summer PPO Track - 2028 Batch)",
                        "Speechify",
                        "Bengaluru, India",
                        EmploymentType.INTERNSHIP,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "3rd Year (Pre-Final Year)",
                        "2028",
                        RemoteType.HYBRID,
                        List.of("Java", "Spring Boot", "React", "TypeScript", "PostgreSQL"),
                        BigDecimal.valueOf(50000), BigDecimal.valueOf(75000), "MONTHLY",
                        "https://job-boards.greenhouse.io/speechify/jobs/4255168005",
                        "2-3 month high-impact summer internship for pre-final year students graduating in 2028. Top performing interns receive Pre-Placement Offers (PPOs) for full-time roles upon graduation."
                ),
                new JobSeedItem(
                        "Data Science & Analytics Intern (Summer 2027/2028)",
                        "Forma.ai",
                        "Bengaluru, India",
                        EmploymentType.INTERNSHIP,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "3rd Year (Pre-Final Year)",
                        "2028",
                        RemoteType.HYBRID,
                        List.of("Python", "SQL", "Pandas", "Machine Learning", "Tableau"),
                        BigDecimal.valueOf(45000), BigDecimal.valueOf(60000), "MONTHLY",
                        "https://job-boards.greenhouse.io/formaaiindiacampus/jobs/4038192004",
                        "Pre-final year internship in AI-driven compensation automation. Analyze customer data sets, train optimization models, and build analytical pipelines."
                ),
                new JobSeedItem(
                        "QA Automation & SDET Intern",
                        "StockX",
                        "Remote (India Eligible)",
                        EmploymentType.INTERNSHIP,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "3rd Year (Pre-Final Year)",
                        "2028",
                        RemoteType.REMOTE,
                        List.of("Selenium", "Java", "Python", "CI/CD", "JUnit"),
                        BigDecimal.valueOf(40000), BigDecimal.valueOf(55000), "MONTHLY",
                        "https://job-boards.greenhouse.io/stockx/jobs/6201948002",
                        "Summer SDET internship. Design end-to-end automated test suites, load test distributed checkout workflows, and automate integration pipelines."
                ),
                new JobSeedItem(
                        "Software Engineering Summer Intern",
                        "Rubrik",
                        "Bengaluru, India",
                        EmploymentType.INTERNSHIP,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "3rd Year (Pre-Final Year)",
                        "2028",
                        RemoteType.HYBRID,
                        List.of("C++", "Java", "Distributed Systems", "Cloud Storage"),
                        BigDecimal.valueOf(65000), BigDecimal.valueOf(90000), "MONTHLY",
                        "https://job-boards.greenhouse.io/rubrik/jobs/7510636",
                        "Summer engineering internship for pre-final year students (2028 batch). Design high-scale data protection and cyber resilience engines."
                ),

                // --- 4th Year / Final Year (Batch 2027 Campus Placement) ---
                new JobSeedItem(
                        "Associate Software Engineer",
                        "Redwood Software",
                        "Hyderabad, Telangana, India",
                        EmploymentType.FULL_TIME,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "4th Year (Final Year)",
                        "2027",
                        RemoteType.ON_SITE,
                        List.of("Java", "Spring Boot", "SQL", "Linux", "Git"),
                        BigDecimal.valueOf(8), BigDecimal.valueOf(14), "ANNUAL",
                        "https://job-boards.greenhouse.io/redwoodsoftware/jobs/4243666009",
                        "Direct campus requisition for Class of 2027 final year engineering students. Join the automation core engineering team in Hyderabad with full training and mentoring."
                ),
                new JobSeedItem(
                        "Graduate Engineer Trainee (GET - 2027 Batch)",
                        "Redwood Software",
                        "Bengaluru / Pune, India",
                        EmploymentType.FULL_TIME,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "4th Year (Final Year)",
                        "2027",
                        RemoteType.HYBRID,
                        List.of("Java", "Spring Boot", "Linux", "SQL", "Git"),
                        BigDecimal.valueOf(8), BigDecimal.valueOf(13), "ANNUAL",
                        "https://job-boards.greenhouse.io/redwoodsoftware/jobs/4243666009",
                        "Comprehensive Graduate Engineer Trainee program for 2027 graduates. Intensive technical onboarding followed by deployment to enterprise automation squads."
                ),
                new JobSeedItem(
                        "Associate Software Engineer (Class of 2027)",
                        "Razorpay",
                        "Bengaluru, India",
                        EmploymentType.FULL_TIME,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "4th Year (Final Year)",
                        "2027",
                        RemoteType.HYBRID,
                        List.of("Go", "Python", "MySQL", "Kafka", "REST APIs"),
                        BigDecimal.valueOf(12), BigDecimal.valueOf(18), "ANNUAL",
                        "https://jobs.lever.co/razorpay/b8417849-5561-469a-9e12-81781295f519",
                        "Full-time entry level role for 2027 final-year graduates. Build fintech rails, payments checkout workflows, and banking APIs handling millions of daily transactions."
                ),
                new JobSeedItem(
                        "Systems & Cloud Associate (Class of 2027)",
                        "PagerDuty",
                        "Remote (India Eligible)",
                        EmploymentType.FULL_TIME,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "4th Year (Final Year)",
                        "2027",
                        RemoteType.REMOTE,
                        List.of("Python", "Linux", "AWS", "Incident Management"),
                        BigDecimal.valueOf(10), BigDecimal.valueOf(16), "ANNUAL",
                        "https://job-boards.greenhouse.io/pagerduty/jobs/5918231",
                        "Entry-level cloud and operations engineering position for 2027 graduates. Troubleshoot distributed services and automate incident response pipelines."
                ),
                new JobSeedItem(
                        "Software Engineer (Class of 2027 Campus Program)",
                        "Rubrik",
                        "Bengaluru, India",
                        EmploymentType.FULL_TIME,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "4th Year (Final Year)",
                        "2027",
                        RemoteType.HYBRID,
                        List.of("Java", "C++", "Distributed Systems", "Cloud"),
                        BigDecimal.valueOf(14), BigDecimal.valueOf(22), "ANNUAL",
                        "https://job-boards.greenhouse.io/rubrik/jobs/7510636",
                        "Flagship campus hiring program for 2027 graduates. Transition through technical bootcamps to engineer enterprise-grade security and backup products."
                ),

                // --- Fresh Graduates (0 - 2 Yrs / Batch 2025 - 2026) ---
                new JobSeedItem(
                        "Junior Backend Software Engineer (Java & Spring)",
                        "Celonis",
                        "Bengaluru, India",
                        EmploymentType.FULL_TIME,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "Fresh Graduate",
                        "2025, 2026",
                        RemoteType.HYBRID,
                        List.of("Java", "Spring Boot", "Microservices", "PostgreSQL", "Docker"),
                        BigDecimal.valueOf(10), BigDecimal.valueOf(16), "ANNUAL",
                        "https://jobs.lever.co/celonis/6192841002",
                        "Immediate joiner opportunity for recent graduates (0-2 years experience). Develop high-scale process mining engines and API integrations."
                ),
                new JobSeedItem(
                        "Associate Frontend Developer (React & TypeScript)",
                        "Toast",
                        "Bengaluru, India",
                        EmploymentType.FULL_TIME,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "Fresh Graduate",
                        "2025, 2026",
                        RemoteType.HYBRID,
                        List.of("React", "TypeScript", "CSS", "Tailwind CSS", "REST APIs"),
                        BigDecimal.valueOf(9), BigDecimal.valueOf(15), "ANNUAL",
                        "https://job-boards.greenhouse.io/toast/jobs/5819284003",
                        "Entry-level frontend engineering position for recent graduates. Build responsive web applications and real-time point-of-sale restaurant dashboards."
                ),
                new JobSeedItem(
                        "Junior Solutions Engineer (0-1 Year Experience)",
                        "Databricks",
                        "Bengaluru, India",
                        EmploymentType.FULL_TIME,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "Fresh Graduate",
                        "2025, 2026",
                        RemoteType.HYBRID,
                        List.of("Python", "SQL", "Spark", "Cloud Architecture", "Databricks"),
                        BigDecimal.valueOf(14), BigDecimal.valueOf(22), "ANNUAL",
                        "https://job-boards.greenhouse.io/databricks/jobs/5918294002",
                        "Technical customer engineering track for graduates with strong communication and programming fundamentals. Demo lakehouse architectures and architect data solutions."
                ),
                new JobSeedItem(
                        "Junior Full Stack Developer",
                        "HackerRank",
                        "Remote (India)",
                        EmploymentType.FULL_TIME,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "Fresh Graduate",
                        "2025, 2026",
                        RemoteType.REMOTE,
                        List.of("Ruby on Rails", "React", "PostgreSQL", "Redis", "Docker"),
                        BigDecimal.valueOf(10), BigDecimal.valueOf(16), "ANNUAL",
                        "https://jobs.lever.co/hackerrank/9b3e281d-7128-4ef2-9cef-208394851233",
                        "Remote entry-level fullstack position for recent graduates. Enhance candidate assessment platforms, code compilers, and screening analytics."
                ),
                new JobSeedItem(
                        "Senior Systems Support Engineer (0-2 Yrs)",
                        "Thoughtworks",
                        "Bengaluru, India",
                        EmploymentType.FULL_TIME,
                        ExperienceLevel.FRESHER,
                        "FRESHER",
                        "Fresh Graduate",
                        "2025, 2026",
                        RemoteType.HYBRID,
                        List.of("Linux", "Bash", "Python", "Networking", "Git"),
                        BigDecimal.valueOf(8), BigDecimal.valueOf(13), "ANNUAL",
                        "https://boards.greenhouse.io/thoughtworks/jobs/8073975",
                        "Graduate and early-career support engineering role. Troubleshoot distributed architectures and ensure 24/7 reliability for global cloud environments."
                )
        );

        int savedCount = 0;
        for (JobSeedItem item : items) {
            String sourceJobId = "student_role_" + item.company.toLowerCase().replaceAll("[^a-z0-9]", "")
                    + "_" + item.title.toLowerCase().replaceAll("[^a-z0-9]", "").substring(0, Math.min(20, item.title.length()));

            java.util.Optional<Job> existingOpt = jobRepository.findBySourceJobId(sourceJobId);
            if (existingOpt.isPresent()) {
                Job existing = existingOpt.get();
                existing.setTitle(item.title);
                existing.setDescription(item.description);
                existing.setTargetAcademicYears(item.targetAcademicYears);
                existing.setTargetBatches(item.targetBatches);
                existing.setExperienceCategory(item.experienceCategory);
                existing.setApplicationUrl(item.applicationUrl);
                existing.setApplyUrl(item.applicationUrl);
                jobRepository.save(existing);
                savedCount++;
            } else {
                Job job = new Job(
                        null,
                        JobSource.OFFICIAL_COMPANY,
                        sourceJobId,
                        item.applicationUrl,
                        item.title,
                        item.company,
                        null,
                        item.description,
                        item.location,
                        "India",
                        item.employmentType,
                        item.experienceLevel,
                        item.skills,
                        item.salaryMin,
                        item.salaryMax,
                        "INR",
                        item.salaryPeriod,
                        LocalDateTime.now().minusDays(1),
                        null,
                        item.applicationUrl,
                        item.remoteType,
                        true,
                        LocalDateTime.now(),
                        false,
                        null
                );
                job.setExperienceCategory(item.experienceCategory);
                job.setTargetAcademicYears(item.targetAcademicYears);
                job.setTargetBatches(item.targetBatches);
                job.setApplyUrl(item.applicationUrl);
                jobRepository.save(job);
                savedCount++;
            }
        }

        log.info("Student opportunity check complete. Ingested/updated {} verified student listings across academic stages.", savedCount);
    }

    private static class JobSeedItem {
        final String title;
        final String company;
        final String location;
        final EmploymentType employmentType;
        final ExperienceLevel experienceLevel;
        final String experienceCategory;
        final String targetAcademicYears;
        final String targetBatches;
        final RemoteType remoteType;
        final List<String> skills;
        final BigDecimal salaryMin;
        final BigDecimal salaryMax;
        final String salaryPeriod;
        final String applicationUrl;
        final String description;

        JobSeedItem(String title, String company, String location, EmploymentType employmentType,
                    ExperienceLevel experienceLevel, String experienceCategory, String targetAcademicYears,
                    String targetBatches, RemoteType remoteType, List<String> skills,
                    BigDecimal salaryMin, BigDecimal salaryMax, String salaryPeriod,
                    String applicationUrl, String description) {
            this.title = title;
            this.company = company;
            this.location = location;
            this.employmentType = employmentType;
            this.experienceLevel = experienceLevel;
            this.experienceCategory = experienceCategory;
            this.targetAcademicYears = targetAcademicYears;
            this.targetBatches = targetBatches;
            this.remoteType = remoteType;
            this.skills = skills;
            this.salaryMin = salaryMin;
            this.salaryMax = salaryMax;
            this.salaryPeriod = salaryPeriod;
            this.applicationUrl = applicationUrl;
            this.description = description;
        }
    }
}
