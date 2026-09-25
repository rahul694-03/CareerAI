package com.careerai.config;

import com.careerai.service.JobIngestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@EnableScheduling
public class JobSyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(JobSyncScheduler.class);

    private final JobIngestionService jobIngestionService;

    public JobSyncScheduler(JobIngestionService jobIngestionService) {
        this.jobIngestionService = jobIngestionService;
    }

    /**
     * Run initial synchronization when the application is completely ready.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        log.info("Application ready: Triggering initial real job ingestion sync...");
        try {
            Map<String, Object> result = jobIngestionService.syncAllProviders();
            log.info("Initial job synchronization finished: {}", result);
        } catch (Exception e) {
            log.error("Failed during initial job sync: {}", e.getMessage(), e);
        }
    }

    /**
     * Run hourly synchronization across active legitimate job providers.
     */
    @Scheduled(fixedDelayString = "${job.sync.interval.ms:3600000}", initialDelay = 1800000)
    public void scheduledSync() {
        log.info("Scheduled job synchronization started...");
        try {
            Map<String, Object> result = jobIngestionService.syncAllProviders();
            log.info("Scheduled job sync completed successfully: {}", result);
        } catch (Exception e) {
            log.error("Scheduled job sync failed: {}", e.getMessage(), e);
        }
    }
}
