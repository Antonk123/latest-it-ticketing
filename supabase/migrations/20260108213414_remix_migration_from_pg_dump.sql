CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    label text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ticket_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    file_type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ticket_checklists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_checklists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    label text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    category_id uuid,
    requester_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    closed_at timestamp with time zone,
    notes text,
    solution text
);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: ticket_attachments ticket_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_pkey PRIMARY KEY (id);


--
-- Name: ticket_checklists ticket_checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_checklists
    ADD CONSTRAINT ticket_checklists_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: idx_ticket_checklists_ticket_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ticket_checklists_ticket_id ON public.ticket_checklists USING btree (ticket_id);


--
-- Name: ticket_checklists update_ticket_checklists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ticket_checklists_updated_at BEFORE UPDATE ON public.ticket_checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tickets update_tickets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ticket_attachments ticket_attachments_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: ticket_checklists ticket_checklists_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_checklists
    ADD CONSTRAINT ticket_checklists_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: tickets tickets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: tickets tickets_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.contacts(id);


--
-- Name: ticket_attachments Authenticated users can delete attachments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete attachments" ON public.ticket_attachments FOR DELETE TO authenticated USING (true);


--
-- Name: categories Authenticated users can delete categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);


--
-- Name: ticket_checklists Authenticated users can delete checklists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete checklists" ON public.ticket_checklists FOR DELETE USING (true);


--
-- Name: contacts Authenticated users can delete contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete contacts" ON public.contacts FOR DELETE TO authenticated USING (true);


--
-- Name: tickets Authenticated users can delete tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete tickets" ON public.tickets FOR DELETE TO authenticated USING (true);


--
-- Name: ticket_attachments Authenticated users can insert attachments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert attachments" ON public.ticket_attachments FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: categories Authenticated users can insert categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: ticket_checklists Authenticated users can insert checklists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert checklists" ON public.ticket_checklists FOR INSERT WITH CHECK (true);


--
-- Name: contacts Authenticated users can insert contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: tickets Authenticated users can insert tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert tickets" ON public.tickets FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: categories Authenticated users can update categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update categories" ON public.categories FOR UPDATE TO authenticated USING (true);


--
-- Name: ticket_checklists Authenticated users can update checklists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update checklists" ON public.ticket_checklists FOR UPDATE USING (true);


--
-- Name: contacts Authenticated users can update contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update contacts" ON public.contacts FOR UPDATE TO authenticated USING (true);


--
-- Name: tickets Authenticated users can update tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update tickets" ON public.tickets FOR UPDATE TO authenticated USING (true);


--
-- Name: ticket_attachments Authenticated users can view attachments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view attachments" ON public.ticket_attachments FOR SELECT TO authenticated USING (true);


--
-- Name: categories Authenticated users can view categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view categories" ON public.categories FOR SELECT TO authenticated USING (true);


--
-- Name: ticket_checklists Authenticated users can view checklists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view checklists" ON public.ticket_checklists FOR SELECT USING (true);


--
-- Name: contacts Authenticated users can view contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view contacts" ON public.contacts FOR SELECT TO authenticated USING (true);


--
-- Name: tickets Authenticated users can view tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view tickets" ON public.tickets FOR SELECT TO authenticated USING (true);


--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: contacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: ticket_attachments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

--
-- Name: ticket_checklists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ticket_checklists ENABLE ROW LEVEL SECURITY;

--
-- Name: tickets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;