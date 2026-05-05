--
-- PostgreSQL database dump
--

\restrict jeh2kH6TZ0jZ9xfQxFKR3Coa391vXikn3BAgowVzxHMj04BPoh05koPCfCdrtxw

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: kabupaten; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kabupaten (
    id integer NOT NULL,
    provinsi_id integer NOT NULL,
    nama_kabupaten character varying(100) NOT NULL,
    nama_kabupaten_en character varying(255)
);


ALTER TABLE public.kabupaten OWNER TO postgres;

--
-- Name: kabupaten_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kabupaten_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kabupaten_id_seq OWNER TO postgres;

--
-- Name: kabupaten_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kabupaten_id_seq OWNED BY public.kabupaten.id;


--
-- Name: kategori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kategori (
    id integer NOT NULL,
    nama_kategori character varying(100) NOT NULL,
    nama_kategori_en character varying(255)
);


ALTER TABLE public.kategori OWNER TO postgres;

--
-- Name: kategori_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kategori_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kategori_id_seq OWNER TO postgres;

--
-- Name: kategori_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kategori_id_seq OWNED BY public.kategori.id;


--
-- Name: museum; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.museum (
    id integer NOT NULL,
    source_id character varying(100) NOT NULL,
    nama_museum character varying(255) NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    provinsi_id integer NOT NULL,
    kabupaten_id integer NOT NULL,
    kategori_id integer,
    deskripsi text,
    tahun_dibangun integer,
    alamat_lengkap text,
    jam_buka text,
    harga_tiket text,
    website text,
    sumber_informasi text,
    foto_url text,
    deskripsi_en text,
    jam_buka_en text,
    alamat_lengkap_en text,
    virtual_tour_url text,
    livecam_url text
);


ALTER TABLE public.museum OWNER TO postgres;

--
-- Name: museum_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.museum_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.museum_id_seq OWNER TO postgres;

--
-- Name: museum_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.museum_id_seq OWNED BY public.museum.id;


--
-- Name: provinsi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provinsi (
    id integer NOT NULL,
    nama_provinsi character varying(100) NOT NULL,
    nama_provinsi_en character varying(255)
);


ALTER TABLE public.provinsi OWNER TO postgres;

--
-- Name: provinsi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.provinsi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.provinsi_id_seq OWNER TO postgres;

--
-- Name: provinsi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.provinsi_id_seq OWNED BY public.provinsi.id;


--
-- Name: staging_museum; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staging_museum (
    source_id character varying(100),
    nama_museum character varying(255),
    latitude double precision,
    longitude double precision,
    provinsi character varying(100),
    kabupaten character varying(100),
    kategori character varying(100)
);


ALTER TABLE public.staging_museum OWNER TO postgres;

--
-- Name: kabupaten id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kabupaten ALTER COLUMN id SET DEFAULT nextval('public.kabupaten_id_seq'::regclass);


--
-- Name: kategori id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategori ALTER COLUMN id SET DEFAULT nextval('public.kategori_id_seq'::regclass);


--
-- Name: museum id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.museum ALTER COLUMN id SET DEFAULT nextval('public.museum_id_seq'::regclass);


--
-- Name: provinsi id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinsi ALTER COLUMN id SET DEFAULT nextval('public.provinsi_id_seq'::regclass);


--
-- Name: kabupaten kabupaten_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kabupaten
    ADD CONSTRAINT kabupaten_pkey PRIMARY KEY (id);


--
-- Name: kategori kategori_nama_kategori_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategori
    ADD CONSTRAINT kategori_nama_kategori_key UNIQUE (nama_kategori);


--
-- Name: kategori kategori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategori
    ADD CONSTRAINT kategori_pkey PRIMARY KEY (id);


--
-- Name: museum museum_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.museum
    ADD CONSTRAINT museum_pkey PRIMARY KEY (id);


--
-- Name: museum museum_source_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.museum
    ADD CONSTRAINT museum_source_id_key UNIQUE (source_id);


--
-- Name: provinsi provinsi_nama_provinsi_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinsi
    ADD CONSTRAINT provinsi_nama_provinsi_key UNIQUE (nama_provinsi);


--
-- Name: provinsi provinsi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinsi
    ADD CONSTRAINT provinsi_pkey PRIMARY KEY (id);


--
-- Name: kabupaten uq_kabupaten; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kabupaten
    ADD CONSTRAINT uq_kabupaten UNIQUE (provinsi_id, nama_kabupaten);


--
-- Name: idx_kabupaten_provinsi_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kabupaten_provinsi_id ON public.kabupaten USING btree (provinsi_id);


--
-- Name: idx_museum_kabupaten_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_museum_kabupaten_id ON public.museum USING btree (kabupaten_id);


--
-- Name: idx_museum_kategori_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_museum_kategori_id ON public.museum USING btree (kategori_id);


--
-- Name: idx_museum_nama; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_museum_nama ON public.museum USING btree (nama_museum);


--
-- Name: idx_museum_provinsi_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_museum_provinsi_id ON public.museum USING btree (provinsi_id);


--
-- Name: kabupaten fk_kabupaten_provinsi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kabupaten
    ADD CONSTRAINT fk_kabupaten_provinsi FOREIGN KEY (provinsi_id) REFERENCES public.provinsi(id) ON DELETE CASCADE;


--
-- Name: museum fk_museum_kabupaten; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.museum
    ADD CONSTRAINT fk_museum_kabupaten FOREIGN KEY (kabupaten_id) REFERENCES public.kabupaten(id) ON DELETE RESTRICT;


--
-- Name: museum fk_museum_kategori; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.museum
    ADD CONSTRAINT fk_museum_kategori FOREIGN KEY (kategori_id) REFERENCES public.kategori(id) ON DELETE SET NULL;


--
-- Name: museum fk_museum_provinsi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.museum
    ADD CONSTRAINT fk_museum_provinsi FOREIGN KEY (provinsi_id) REFERENCES public.provinsi(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict jeh2kH6TZ0jZ9xfQxFKR3Coa391vXikn3BAgowVzxHMj04BPoh05koPCfCdrtxw

