-- Database: silizium

-- DROP DATABASE silizium;
CREATE DATABASE silizium
  WITH OWNER = silizium
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'en_US.UTF-8'
       LC_CTYPE = 'en_US.UTF-8'
       CONNECTION LIMIT = -1;


-- Table: public.messages

-- DROP TABLE public.messages;

CREATE TABLE public.messages
(
 value double precision NOT NULL,
 "time" timestamp with time zone NOT NULL,
 topic_id integer NOT NULL,
 CONSTRAINT messages_pkey PRIMARY KEY (topic_id, "time"),
 CONSTRAINT messages_topic_id_fkey FOREIGN KEY (topic_id)
     REFERENCES public.topics (id) MATCH SIMPLE
     ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
 OIDS=FALSE,
 autovacuum_enabled=true
);

ALTER TABLE public.messages
  OWNER TO silizium;



-- Table: public.topics

-- DROP TABLE public.topics;

CREATE TABLE public.topics
(
id integer NOT NULL DEFAULT nextval('topics_id_seq'::regclass),
topic character varying NOT NULL,
CONSTRAINT topics_pkey PRIMARY KEY (id),
CONSTRAINT topics_topic_key UNIQUE (topic)
)
WITH (
OIDS=FALSE
);
ALTER TABLE public.topics
OWNER TO silizium;
