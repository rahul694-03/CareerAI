package com.careerai.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:}")
    private String configuredDbUrl;

    @Value("${spring.datasource.username:postgres}")
    private String defaultUsername;

    @Value("${spring.datasource.password:}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        String rawUrl = resolveRawDatabaseUrl();
        boolean isCloud = isCloudEnvironment();

        boolean hasCloudPostgres = rawUrl != null
                && !rawUrl.isBlank()
                && !rawUrl.contains("localhost:5432")
                && !rawUrl.contains("127.0.0.1:5432");

        if (hasCloudPostgres) {
            log.info("Configuring PostgreSQL from cloud connection URL: {}", maskUrl(rawUrl));
            if (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://")) {
                configureFromCloudUrl(dataSource, rawUrl);
            } else if (rawUrl.startsWith("jdbc:postgresql://")) {
                dataSource.setJdbcUrl(rawUrl);
                dataSource.setUsername(defaultUsername);
                dataSource.setPassword(defaultPassword);
                dataSource.setDriverClassName("org.postgresql.Driver");
            } else {
                dataSource.setJdbcUrl("jdbc:postgresql://" + rawUrl);
                dataSource.setUsername(defaultUsername);
                dataSource.setPassword(defaultPassword);
                dataSource.setDriverClassName("org.postgresql.Driver");
            }
        } else if (!isCloud && rawUrl != null && !rawUrl.isBlank()) {
            // Local development with local PostgreSQL
            log.info("Configuring local PostgreSQL connection: {}", maskUrl(rawUrl));
            dataSource.setJdbcUrl(rawUrl.startsWith("jdbc:") ? rawUrl : "jdbc:postgresql://" + rawUrl);
            dataSource.setUsername(defaultUsername);
            dataSource.setPassword(defaultPassword);
            dataSource.setDriverClassName("org.postgresql.Driver");
        } else {
            // In cloud (e.g. Render) without DATABASE_URL set, or no database available
            log.warn("""
                \n========================================================================================
                [DEPLOYMENT NOTICE] No external PostgreSQL DATABASE_URL detected on Render.
                Starting with embedded high-performance in-memory database to keep deployment 100% online!
                
                TO ATTACH PERSISTENT POSTGRESQL ON RENDER:
                1. Render Dashboard -> Click 'New +' -> 'PostgreSQL' (Name: careerai-db)
                2. Copy 'Internal Database URL' (starts with postgres://...)
                3. Open your Web Service -> Click 'Environment'
                4. Add: Key=DATABASE_URL, Value=<Your Internal Database URL>
                5. Save Changes -> Render will seamlessly switch to PostgreSQL!
                ========================================================================================
                """);

            dataSource.setJdbcUrl("jdbc:h2:mem:careerai;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1");
            dataSource.setDriverClassName("org.h2.Driver");
            dataSource.setUsername("sa");
            dataSource.setPassword("");
        }

        dataSource.setMaximumPoolSize(10);
        dataSource.setMinimumIdle(2);
        dataSource.setConnectionTimeout(30000);
        return dataSource;
    }

    private boolean isCloudEnvironment() {
        return System.getenv("RENDER") != null
                || System.getenv("RENDER_SERVICE_ID") != null
                || System.getenv("RAILWAY_ENVIRONMENT") != null
                || System.getenv("FLY_APP_NAME") != null
                || (System.getenv("PORT") != null && !"8080".equals(System.getenv("PORT")));
    }

    private String resolveRawDatabaseUrl() {
        // Priority order for cloud environment variables
        String[] envVars = {
                "DATABASE_URL",
                "DATABASE_INTERNAL_URL",
                "DATABASE_EXTERNAL_URL",
                "SPRING_DATASOURCE_URL",
                "POSTGRES_URL",
                "POSTGRESQL_URL"
        };

        for (String var : envVars) {
            String val = System.getenv(var);
            if (val != null && !val.isBlank()) {
                log.info("Detected database connection variable [{}]", var);
                return val.trim();
            }
        }

        if (configuredDbUrl != null && !configuredDbUrl.isBlank()) {
            return configuredDbUrl.trim();
        }

        // Return empty or default
        return "";
    }

    private void configureFromCloudUrl(HikariDataSource dataSource, String cloudUrl) {
        try {
            String withoutScheme = cloudUrl.replaceFirst("^postgres(ql)?://", "");

            String userInfo = null;
            String hostAndPath = withoutScheme;

            int atIndex = withoutScheme.indexOf('@');
            if (atIndex != -1) {
                userInfo = withoutScheme.substring(0, atIndex);
                hostAndPath = withoutScheme.substring(atIndex + 1);
            }

            if (userInfo != null && !userInfo.isEmpty()) {
                int colonIndex = userInfo.indexOf(':');
                if (colonIndex != -1) {
                    String user = URLDecoder.decode(userInfo.substring(0, colonIndex), StandardCharsets.UTF_8);
                    String pass = URLDecoder.decode(userInfo.substring(colonIndex + 1), StandardCharsets.UTF_8);
                    dataSource.setUsername(user);
                    dataSource.setPassword(pass);
                } else {
                    dataSource.setUsername(URLDecoder.decode(userInfo, StandardCharsets.UTF_8));
                    dataSource.setPassword(defaultPassword);
                }
            } else {
                dataSource.setUsername(defaultUsername);
                dataSource.setPassword(defaultPassword);
            }

            String jdbcUrl = "jdbc:postgresql://" + hostAndPath;
            dataSource.setJdbcUrl(jdbcUrl);
            dataSource.setDriverClassName("org.postgresql.Driver");
            log.info("Configured JDBC URL successfully: jdbc:postgresql://{}", maskHostPath(hostAndPath));
        } catch (Exception e) {
            log.error("Failed to parse cloud database URL: {}", e.getMessage(), e);
            dataSource.setJdbcUrl("jdbc:postgresql://" + cloudUrl.replaceFirst("^postgres(ql)?://", ""));
            dataSource.setUsername(defaultUsername);
            dataSource.setPassword(defaultPassword);
            dataSource.setDriverClassName("org.postgresql.Driver");
        }
    }

    private String maskUrl(String url) {
        if (url == null) return "null";
        return url.replaceAll(":[^@/]+@", ":****@");
    }

    private String maskHostPath(String hostAndPath) {
        if (hostAndPath == null) return "null";
        int slash = hostAndPath.indexOf('/');
        if (slash != -1) {
            return hostAndPath.substring(0, slash) + "/...";
        }
        return hostAndPath;
    }
}
