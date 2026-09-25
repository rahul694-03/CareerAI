package com.careerai.repository;

import com.careerai.entity.Job;
import com.careerai.entity.JobApplication;
import com.careerai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserOrderByAppliedAtDesc(User user);

    Optional<JobApplication> findByUserAndJob(User user, Job job);

    boolean existsByUserAndJob(User user, Job job);

    long countByUser(User user);
}
