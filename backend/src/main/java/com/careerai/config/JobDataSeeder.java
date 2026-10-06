package com.careerai.config;

import com.careerai.repository.JobRepository;
import com.careerai.service.JobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
public class JobDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(JobDataSeeder.class);
    private final JobRepository jobRepository;
    private final JobService jobService;

    public JobDataSeeder(JobRepository jobRepository, JobService jobService) {
        this.jobRepository = jobRepository;
        this.jobService = jobService;
    }

    @Override
    public void run(String... args) {
        // Execute asynchronously so the HTTP server starts immediately and auth requests aren't blocked!
        CompletableFuture.runAsync(() -> {
            try {
                long unclassified = jobRepository.countByExperienceCategoryIsNull();
                if (unclassified > 0) {
                    log.info("JobDataSeeder: Found {} unclassified jobs. Running background reclassification...", unclassified);
                    int reclassified = jobService.reclassifyAllJobs();
                    log.info("JobDataSeeder: Successfully reclassified {} jobs in background.", reclassified);
                } else {
                    log.info("JobDataSeeder: All jobs already categorized. Fast startup completed.");
                }
            } catch (Exception e) {
                log.warn("JobDataSeeder background execution error: {}", e.getMessage());
            }
        });
    }
}
