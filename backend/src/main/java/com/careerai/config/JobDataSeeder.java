package com.careerai.config;

import com.careerai.service.JobIngestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class JobDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(JobDataSeeder.class);
    private final JobIngestionService jobIngestionService;
    private final com.careerai.service.JobService jobService;

    public JobDataSeeder(JobIngestionService jobIngestionService, com.careerai.service.JobService jobService) {
        this.jobIngestionService = jobIngestionService;
        this.jobService = jobService;
    }

    @Override
    public void run(String... args) {
        log.info("JobDataSeeder: Executing automatic database reclassification for freshers vs seniors & academic years...");
        int reclassified = jobService.reclassifyAllJobs();
        log.info("JobDataSeeder: Successfully reclassified {} jobs into Fresher, Senior, and Mid-Level categories.", reclassified);
    }
}
