-- Database: silizium

-- DROP DATABASE silizium;
CREATE DATABASE silizium
  WITH OWNER = silizium
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'en_US.UTF-8'
       LC_CTYPE = 'en_US.UTF-8'
       CONNECTION LIMIT = -1;


-- Table: messages

-- DROP TABLE messages;
CREATE TABLE messages
(
 "time" timestamp without time zone NOT NULL,
 topic character varying NOT NULL,
 value double precision
 CONSTRAINT primary_key PRIMARY KEY (topic, "time")
)
WITH (
 OIDS=FALSE,
 autovacuum_enabled=true
);
ALTER TABLE messages
 OWNER TO silizium;
