--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.2

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: approval_log; Type: TABLE; Schema: public; Owner: PinjamRuang_owner
--

CREATE TABLE public.approval_log (
    id integer NOT NULL,
    peminjaman_id integer,
    admin_id integer,
    status_sebelumnya character varying(20) NOT NULL,
    status_baru character varying(20) NOT NULL,
    catatan text,
    waktu_perubahan timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.approval_log OWNER TO "PinjamRuang_owner";

--
-- Name: approval_log_id_seq; Type: SEQUENCE; Schema: public; Owner: PinjamRuang_owner
--

CREATE SEQUENCE public.approval_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.approval_log_id_seq OWNER TO "PinjamRuang_owner";

--
-- Name: approval_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: PinjamRuang_owner
--

ALTER SEQUENCE public.approval_log_id_seq OWNED BY public.approval_log.id;


--
-- Name: gedung; Type: TABLE; Schema: public; Owner: PinjamRuang_owner
--

CREATE TABLE public.gedung (
    id integer NOT NULL,
    nama character varying(100) NOT NULL,
    lokasi character varying(255),
    singkatan character varying(10),
    jam_operasional character varying(100),
    pengelola character varying(100),
    posisi_peta_x double precision,
    posisi_peta_y double precision,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.gedung OWNER TO "PinjamRuang_owner";

--
-- Name: gedung_id_seq; Type: SEQUENCE; Schema: public; Owner: PinjamRuang_owner
--

CREATE SEQUENCE public.gedung_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gedung_id_seq OWNER TO "PinjamRuang_owner";

--
-- Name: gedung_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: PinjamRuang_owner
--

ALTER SEQUENCE public.gedung_id_seq OWNED BY public.gedung.id;


--
-- Name: peminjaman; Type: TABLE; Schema: public; Owner: PinjamRuang_owner
--

CREATE TABLE public.peminjaman (
    id integer NOT NULL,
    user_id integer,
    ruangan_id integer,
    tanggal date NOT NULL,
    waktu_mulai time without time zone NOT NULL,
    waktu_selesai time without time zone NOT NULL,
    keperluan character varying(255) NOT NULL,
    jumlah_peserta integer NOT NULL,
    catatan text,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.peminjaman OWNER TO "PinjamRuang_owner";

--
-- Name: peminjaman_id_seq; Type: SEQUENCE; Schema: public; Owner: PinjamRuang_owner
--

CREATE SEQUENCE public.peminjaman_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.peminjaman_id_seq OWNER TO "PinjamRuang_owner";

--
-- Name: peminjaman_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: PinjamRuang_owner
--

ALTER SEQUENCE public.peminjaman_id_seq OWNED BY public.peminjaman.id;


--
-- Name: ruangan; Type: TABLE; Schema: public; Owner: PinjamRuang_owner
--

CREATE TABLE public.ruangan (
    id integer NOT NULL,
    gedung_id integer,
    nama character varying(100) NOT NULL,
    lantai integer NOT NULL,
    kapasitas integer NOT NULL,
    luas double precision,
    tipe character varying(50),
    fasilitas text,
    url_gambar character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ruangan OWNER TO "PinjamRuang_owner";

--
-- Name: ruangan_id_seq; Type: SEQUENCE; Schema: public; Owner: PinjamRuang_owner
--

CREATE SEQUENCE public.ruangan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ruangan_id_seq OWNER TO "PinjamRuang_owner";

--
-- Name: ruangan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: PinjamRuang_owner
--

ALTER SEQUENCE public.ruangan_id_seq OWNED BY public.ruangan.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: PinjamRuang_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO "PinjamRuang_owner";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: PinjamRuang_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO "PinjamRuang_owner";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: PinjamRuang_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: approval_log id; Type: DEFAULT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.approval_log ALTER COLUMN id SET DEFAULT nextval('public.approval_log_id_seq'::regclass);


--
-- Name: gedung id; Type: DEFAULT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.gedung ALTER COLUMN id SET DEFAULT nextval('public.gedung_id_seq'::regclass);


--
-- Name: peminjaman id; Type: DEFAULT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.peminjaman ALTER COLUMN id SET DEFAULT nextval('public.peminjaman_id_seq'::regclass);


--
-- Name: ruangan id; Type: DEFAULT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.ruangan ALTER COLUMN id SET DEFAULT nextval('public.ruangan_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: approval_log; Type: TABLE DATA; Schema: public; Owner: PinjamRuang_owner
--

COPY public.approval_log (id, peminjaman_id, admin_id, status_sebelumnya, status_baru, catatan, waktu_perubahan) FROM stdin;
1	2	7	pending	approved	Reservasi disetujui oleh admin	2025-05-18 22:05:38.009663
2	1	7	pending	rejected	Reservasi ditolak oleh admin	2025-05-18 22:05:45.395113
3	3	8	pending	approved	Reservasi disetujui oleh admin	2025-05-19 03:05:46.479426
4	4	12	pending	rejected	Reservasi ditolak oleh admin	2025-05-20 10:08:54.543375
\.


--
-- Data for Name: gedung; Type: TABLE DATA; Schema: public; Owner: PinjamRuang_owner
--

COPY public.gedung (id, nama, lokasi, singkatan, jam_operasional, pengelola, posisi_peta_x, posisi_peta_y, created_at, updated_at) FROM stdin;
2	Gedung K	Fakultas Teknik	K	08:00 - 20:00	Jane Smith	106.8240595657383	-6.362428067348237	2025-05-17 00:28:39.643304	2025-05-17 00:28:39.643304
1	Gedung S	Fakultas Teknik	S	08:00 - 17:00	Jane Doe	106.82468938927117	-6.361482386077552	2025-05-17 00:28:39.643304	2025-05-17 00:28:39.643304
3	Gedung GK	Fakultas Teknik	GK	08:00 - 16:00	Bob Johnson	106.82459880268621	-6.3612377953670896	2025-05-17 00:28:39.643304	2025-05-17 00:28:39.643304
4	Gedung Dekanat	Fakultas Teknik	D	08:00 - 17:00	Departemen Fasilitas FTUI	106.82402136574673	-6.361659353302688	2025-05-25 09:18:39.312266	2025-05-25 09:18:39.312266
5	Gedung A	Fakultas Teknik	A	07:00 - 20:00	Departemen Fasilitas FTUI	106.82347	-6.36132	2025-05-25 09:18:39.312266	2025-05-25 09:18:39.312266
6	Gedung E.C	Fakultas Teknik	EC	08:00 - 18:00	Departemen Fasilitas FTUI	106.82511271888151	-6.3622051691798	2025-05-25 09:18:39.312266	2025-05-25 09:18:39.312266
7	Gedung ICell	Fakultas Teknik	IC	08:00 - 19:00	DTE FTUI	106.8229403292571	-6.362859290375997	2025-05-25 09:18:39.312266	2025-05-25 09:18:39.312266
\.


--
-- Data for Name: peminjaman; Type: TABLE DATA; Schema: public; Owner: PinjamRuang_owner
--

COPY public.peminjaman (id, user_id, ruangan_id, tanggal, waktu_mulai, waktu_selesai, keperluan, jumlah_peserta, catatan, status, created_at, updated_at) FROM stdin;
2	4	1	2025-05-31	12:00:00	20:00:00	IME	10	\N	approved	2025-05-17 06:07:21.107115	2025-05-18 22:05:37.980501
1	4	4	2025-05-31	12:23:00	15:00:00	Apa ya	12	Apakah ada alat musik?	rejected	2025-05-17 04:28:38.999585	2025-05-18 22:05:45.36863
3	6	4	2025-05-29	10:20:00	12:30:00	Hearing 	30	tidak ada	approved	2025-05-19 03:04:36.34017	2025-05-19 03:05:46.44319
4	12	1	2025-05-20	16:00:00	18:00:00	Sharing Session	30	\N	rejected	2025-05-20 10:08:24.91239	2025-05-20 10:08:54.479729
\.


--
-- Data for Name: ruangan; Type: TABLE DATA; Schema: public; Owner: PinjamRuang_owner
--

COPY public.ruangan (id, gedung_id, nama, lantai, kapasitas, luas, tipe, fasilitas, url_gambar, created_at, updated_at) FROM stdin;
1	1	Ruangan S101	1	30	40	Kelas	Proyektor, AC, Whiteboard	\N	2025-05-17 00:28:49.788399	2025-05-17 00:28:49.788399
2	1	Ruangan S201	2	50	60	Laboratorium	Komputer, AC, Proyektor	\N	2025-05-17 00:28:49.788399	2025-05-17 00:28:49.788399
3	2	Ruangan K101	1	25	35	Kelas	Proyektor, AC, Whiteboard	\N	2025-05-17 00:28:49.788399	2025-05-17 00:28:49.788399
4	3	Ruangan GK201	2	40	50	Seminar	Proyektor, Sound System, AC	\N	2025-05-17 00:28:49.788399	2025-05-17 00:28:49.788399
5	4	Ruangan Dekanat	1	60	\N	Ruang Rapat	\N	https://hackmd.io/_uploads/B1jJPwezlx.jpg	2025-05-25 09:53:34.674729	2025-05-25 09:53:34.674729
6	1	S.102	1	70	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
7	1	S.103	1	40	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
8	1	S.202	2	70	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
9	1	S.203	2	70	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
10	1	S.204	2	40	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
11	1	S.205	2	70	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
12	1	S.301	3	40	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
13	1	S.302	3	70	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
14	1	S.303	3	40	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
15	1	S.304	3	70	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
16	1	S.305	3	70	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
17	1	S.401	4	60	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
18	1	S.402	4	80	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
19	1	S.403	4	45	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
20	1	S.404	4	60	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
21	1	S.405	4	100	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
22	1	S.501	5	45	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
23	1	S.502	5	90	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
24	1	S.503	5	80	\N	Studio Gambar	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
25	1	S.504	5	90	\N	Kelas	\N	https://hackmd.io/_uploads/r1ikwDlzlx.jpg	2025-05-25 10:05:49.081664	2025-05-25 10:05:49.081664
26	2	K.102	1	80	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
27	2	K.103	1	80	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
28	2	K.104	1	50	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
29	2	K.105	1	50	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
30	2	K.106	1	80	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
31	2	K.107	1	80	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
32	2	K.108	1	50	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
33	2	K.201	2	45	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
34	2	K.202	2	80	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
35	2	K.203	2	42	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
36	2	K.204	2	80	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
37	2	K.205	2	30	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
38	2	K.206	2	100	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
39	2	K.207	2	80	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
40	2	K.208	2	40	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
41	2	K.209	2	80	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
42	2	K.210	2	70	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
43	2	K.211	2	80	\N	Kelas	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
44	2	K.301	3	200	\N	Aula	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
45	2	K.Lobi	1	100	\N	Lobi	\N	https://hackmd.io/_uploads/SJ3iKwezgx.jpg	2025-05-25 10:09:42.75737	2025-05-25 10:09:42.75737
46	3	GK.302	3	20	\N	Kelas	\N	https://hackmd.io/_uploads/HJ1rtvgMle.jpg	2025-05-25 10:11:40.436845	2025-05-25 10:11:40.436845
47	3	GK.303	3	30	\N	Kelas	\N	https://hackmd.io/_uploads/HJ1rtvgMle.jpg	2025-05-25 10:11:40.436845	2025-05-25 10:11:40.436845
48	3	GK.304	3	30	\N	Kelas	\N	https://hackmd.io/_uploads/HJ1rtvgMle.jpg	2025-05-25 10:11:40.436845	2025-05-25 10:11:40.436845
49	3	GK.305	3	30	\N	Kelas	\N	https://hackmd.io/_uploads/HJ1rtvgMle.jpg	2025-05-25 10:11:40.436845	2025-05-25 10:11:40.436845
50	3	GK.306	3	100	\N	Kelas	\N	https://hackmd.io/_uploads/HJ1rtvgMle.jpg	2025-05-25 10:11:40.436845	2025-05-25 10:11:40.436845
51	3	GK.207	2	54	\N	Kelas	\N	https://hackmd.io/_uploads/HJ1rtvgMle.jpg	2025-05-25 10:11:40.436845	2025-05-25 10:11:40.436845
52	7	R Rapat ICell Lt.2	2	40	\N	Ruang Rapat	\N	https://hackmd.io/_uploads/SyJiawxfll.jpg	2025-05-25 10:15:24.807795	2025-05-25 10:15:24.807795
53	7	Hanggar ICell	1	50	\N	Hanggar	\N	https://hackmd.io/_uploads/SyJiawxfll.jpg	2025-05-25 10:15:24.807795	2025-05-25 10:15:24.807795
54	6	Ruangan di Gedung EC	2	30	\N	Aula	\N	https://hackmd.io/_uploads/H1PgOvefgg.jpg	2025-05-25 10:16:49.052962	2025-05-25 10:16:49.052962
55	5	Ruangan Gedung A	3	20	\N	Studio	\N	https://hackmd.io/_uploads/BkhftvlGlx.jpg	2025-05-25 10:17:29.629073	2025-05-25 10:17:29.629073
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: PinjamRuang_owner
--

COPY public.users (id, username, email, password, role, created_at, updated_at) FROM stdin;
1	admin	admin@example.com	pass	admin	2025-05-17 00:28:30.255953	2025-05-17 00:28:30.255953
2	user1	user1@example.com	pass	user	2025-05-17 00:28:30.255953	2025-05-17 00:28:30.255953
3	mustest	test@example.com	$2b$10$R7y2XG/05Cn07Cxjonamxu3sHl/J6xxZ3.F8/2KUpXM35qoP2hrD2	user	2025-05-17 01:09:13.482826	2025-05-17 01:09:13.482826
4	test	test@mail.ccom	$2b$10$sZnGtKkC1qW2NxNC5A3U4OVHFWRWihz5pyFaGi4iU8ZSBaCwkZvue	user	2025-05-17 04:13:03.19676	2025-05-17 04:13:03.19676
5	admin1	admin1@example.com	$2b$10$XgwA4RxLZQHLPgHMGzCA0.rvPa5Wn9U1oa1HBsF8ru6w7PJfjR2t2	admin	2025-05-18 21:47:04.665745	2025-05-18 21:47:04.665745
6	test1	test1@mail.com	$2b$10$coJl3K/4MnWdMZT2L39nmuyqfzQ/DsPBSk6eyDYiUVtmw.Yj6NUhO	user	2025-05-18 21:49:04.476287	2025-05-18 21:49:04.476287
7	admin	admin@mail.com	$2b$10$.dXKSUTm2cBDH9LYZKCLs.OfTbwVB.jbOMdOHr1M4.hr2Q7ePYNBy	admin	2025-05-18 22:04:55.192061	2025-05-18 22:04:55.192061
8	admintes	admin2@mail.com	$2b$10$Id9N7U5hQvWgNV/QAqt2q.f0fpfx9LAiCi0qcEXn2T4RUGC9VuwxG	admin	2025-05-19 03:02:50.212205	2025-05-19 03:02:50.212205
9	admin-calvin	admin-calvin@email.com	$2b$10$0F04X9X.HRW4.yTr0TCdi.Bet5VrIIM0c4gnEqXt12U8ngxmhML2W	admin	2025-05-19 03:19:26.182109	2025-05-19 03:19:26.182109
10	calvinkatoroy	calvinwkatoroy@gmail.com	$2b$10$66Ur.VXdJGmw5JMOBjrnhej41Oz1QMY0hWCADGhOi8IekyrxXqigy	user	2025-05-19 09:20:23.521343	2025-05-19 09:20:23.521343
11	FarhanRZ	farhanrz2004@gmail.com	$2b$10$G0qvw4I82hN1DsFwMkDuJuFFjqR.kXchrL.xR8ct15ZKddwdeWu/.	admin	2025-05-19 10:45:28.622153	2025-05-19 10:45:28.622153
12	Rafinaryaptr	rafinaufal408@gmail.com	$2b$10$TFdmxEBZgJIP3dsFCCwDc.H4zjcbF7T7EGlTeHkpStHRPtaXJwiD.	admin	2025-05-20 09:57:22.082284	2025-05-20 09:57:22.082284
13	Farhan2	clackermailsandballsocks@gmail.com	$2b$10$Uh0AAeL/qa4jxsbI3aMqT.mnXZa5IvjXIhLeu6jCYCskjJyRsOGqm	admin	2025-05-20 11:29:33.789734	2025-05-20 11:29:33.789734
14	Passnya123456	pass123456@mail.com	$2b$10$XkkUOytQd/rlDxWkyA.0v.pOPrstF83/41V30mhGJZR.ihUc80hNW	admin	2025-05-25 07:35:28.097811	2025-05-25 07:35:28.097811
\.


--
-- Name: approval_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: PinjamRuang_owner
--

SELECT pg_catalog.setval('public.approval_log_id_seq', 4, true);


--
-- Name: gedung_id_seq; Type: SEQUENCE SET; Schema: public; Owner: PinjamRuang_owner
--

SELECT pg_catalog.setval('public.gedung_id_seq', 7, true);


--
-- Name: peminjaman_id_seq; Type: SEQUENCE SET; Schema: public; Owner: PinjamRuang_owner
--

SELECT pg_catalog.setval('public.peminjaman_id_seq', 4, true);


--
-- Name: ruangan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: PinjamRuang_owner
--

SELECT pg_catalog.setval('public.ruangan_id_seq', 55, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: PinjamRuang_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 14, true);


--
-- Name: approval_log approval_log_pkey; Type: CONSTRAINT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.approval_log
    ADD CONSTRAINT approval_log_pkey PRIMARY KEY (id);


--
-- Name: gedung gedung_pkey; Type: CONSTRAINT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.gedung
    ADD CONSTRAINT gedung_pkey PRIMARY KEY (id);


--
-- Name: peminjaman peminjaman_pkey; Type: CONSTRAINT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.peminjaman
    ADD CONSTRAINT peminjaman_pkey PRIMARY KEY (id);


--
-- Name: ruangan ruangan_pkey; Type: CONSTRAINT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.ruangan
    ADD CONSTRAINT ruangan_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: approval_log approval_log_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.approval_log
    ADD CONSTRAINT approval_log_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: approval_log approval_log_peminjaman_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.approval_log
    ADD CONSTRAINT approval_log_peminjaman_id_fkey FOREIGN KEY (peminjaman_id) REFERENCES public.peminjaman(id) ON DELETE CASCADE;


--
-- Name: peminjaman peminjaman_ruangan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.peminjaman
    ADD CONSTRAINT peminjaman_ruangan_id_fkey FOREIGN KEY (ruangan_id) REFERENCES public.ruangan(id) ON DELETE CASCADE;


--
-- Name: peminjaman peminjaman_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.peminjaman
    ADD CONSTRAINT peminjaman_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ruangan ruangan_gedung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: PinjamRuang_owner
--

ALTER TABLE ONLY public.ruangan
    ADD CONSTRAINT ruangan_gedung_id_fkey FOREIGN KEY (gedung_id) REFERENCES public.gedung(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

