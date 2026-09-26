package com.careerai.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/careerai}")
    private String dbUrl;

    @Value("${spring.datasource.username:postgres}")
    private String defaultUsername;

    @Value("${spring.datasource.password:}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();

        if (dbUrl != null && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
            try {
                // Cloud platform URL format: postgres://user:password@host:port/database
                URI uri = new URI(dbUrl.replace("postgresql://", "postgres://"));
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String dbName = (path != null && path.length() > 1) ? path.substring(1) : "";

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName;
                dataSource.setJdbcUrl(jdbcUrl);

                String userInfo = uri.getUserInfo();
                if (userInfo != null && !userInfo.isEmpty()) {
                    String[] parts = userInfo.split(":", 2);
                    dataSource.setUsername(parts[0]);
                    if (parts.length > 1) {
                        dataSource.setPassword(parts[1]);
                    }
                } else {
                    dataSource.setUsername(defaultUsername);
                    dataSource.setPassword(defaultPassword);
                }
                log.info("Configured PostgreSQL DataSource from cloud URL for host: {}:{}", host, port);
            } catch (URISyntaxException e) {
                log.warn("Failed to parse cloud DATABASE_URL as URI, using raw URL: {}", e.getMessage());
                dataSource.setJdbcUrl(dbUrl);
                dataSource.setUsername(defaultUsername);
                dataSource.setPassword(defaultPassword);
            }
        } else {
            dataSource.setJdbcUrl(dbUrl);
            dataSource.setUsername(defaultUsername);
            dataSource.setPassword(defaultPassword);
        }

        dataSource.setDriverClassName("org.postgresql.Driver");
        return dataSource;
    }
}
