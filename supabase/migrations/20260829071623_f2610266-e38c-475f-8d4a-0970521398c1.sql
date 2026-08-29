CREATE TYPE public.bus_status AS ENUM ('AVAILABLE','ASSIGNED','MAINTENANCE','INACTIVE','RETIRED');

CREATE TABLE public.buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_code text NOT NULL UNIQUE,
  bus_number text NOT NULL UNIQUE,
  depot text NOT NULL,
  capacity integer NOT NULL DEFAULT 40 CHECK (capacity > 0 AND capacity < 200),
  bus_type text NOT NULL DEFAULT 'Standard CNG AC',
  status public.bus_status NOT NULL DEFAULT 'AVAILABLE',
  model text,
  energy_pct integer NOT NULL DEFAULT 100 CHECK (energy_pct >= 0 AND energy_pct <= 100),
  odometer_km integer NOT NULL DEFAULT 0 CHECK (odometer_km >= 0),
  current_assignment text,
  last_maintenance date,
  next_inspection_due date,
  efficiency_score numeric(5,2),
  retired_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bus_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id uuid NOT NULL REFERENCES public.buses(id) ON DELETE RESTRICT,
  event_type text NOT NULL,
  from_status public.bus_status,
  to_status public.bus_status,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX bus_events_bus_id_idx ON public.bus_events (bus_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.buses TO anon, authenticated;
GRANT ALL ON public.buses TO service_role;
GRANT SELECT, INSERT ON public.bus_events TO anon, authenticated;
GRANT ALL ON public.bus_events TO service_role;

ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fleet buses are readable" ON public.buses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Fleet buses can be added" ON public.buses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Fleet buses can be updated" ON public.buses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Bus history is readable" ON public.bus_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Bus history can be appended" ON public.bus_events FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER buses_set_updated_at BEFORE UPDATE ON public.buses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.buses (bus_code, bus_number, depot, capacity, bus_type, status, model, energy_pct, odometer_km, current_assignment, last_maintenance, next_inspection_due, efficiency_score) VALUES
('BUS-1042', 'DL-1PD-4219', 'Sukhdev Vihar (EV Central)', 42, 'Low Floor Electric', 'ASSIGNED', 'Tata Starbus EV Ultra 12m', 78, 38450, 'Route 522 / Trip 522-UP-0815', '2026-08-10', '2026-09-10', 94.2),
('BUS-1088', 'DL-1PC-7824', 'Mayapuri Depot', 40, 'Standard CNG AC', 'ASSIGNED', 'Ashok Leyland CNG AC JanBus', 64, 142100, 'Route TMS (+) / Trip TMS-CL-0900', '2026-07-28', '2026-08-30', 88.5),
('BUS-1017', 'DL-1PD-9017', 'Sarojini Nagar Depot', 42, 'Low Floor Electric', 'MAINTENANCE', 'JBM ECO-LIFE e12 EV', 52, 29800, 'Route 505 (Pneumatic Inverter Fault)', '2026-08-01', '2026-09-01', 79.1),
('VEH-04', 'DL-1PD-9082', 'Sarojini Nagar Depot', 42, 'Low Floor Electric', 'AVAILABLE', 'JBM ECO-LIFE e12 EV (Standby Reserve)', 96, 18200, 'Ready for Quick Recovery Dispatch', '2026-08-18', '2026-09-18', 96.8),
('BUS-1120', 'DL-1PC-2204', 'Nehru Place Terminal Depot', 48, 'Standard CNG Non-AC', 'ASSIGNED', 'Tata Marcopolo CNG Low Floor', 81, 189400, 'Route 764 / Trip 764-DN-1015', '2026-08-05', '2026-09-05', 85),
('BUS-1155', 'DL-1PD-3311', 'Sukhdev Vihar (EV Central)', 42, 'Low Floor Electric', 'ASSIGNED', 'Tata Starbus EV Ultra 12m', 92, 22100, 'Route 429 / Trip 429-UP-1100', '2026-08-14', '2026-09-14', 95.1),
('BUS-1192', 'DL-1PC-6641', 'Rohini Depot-I', 40, 'Standard CNG AC', 'ASSIGNED', 'Ashok Leyland CNG AC JanBus', 59, 128900, 'Route 883 / Trip 883-UP-1115', '2026-07-20', '2026-08-30', 89.2),
('BUS-1204', 'DL-1PD-1199', 'Sarojini Nagar Depot', 42, 'Low Floor Electric', 'AVAILABLE', 'Olectra K9 Electric Low Floor', 88, 34200, 'Turnaround Bay Shivaji Stadium', '2026-08-12', '2026-09-12', 93.4),
('BUS-1288', 'DL-1PC-8472', 'Rohini Depot-I', 40, 'Standard CNG AC', 'ASSIGNED', 'Ashok Leyland CNG 12m', 74, 45754, 'Route TMS (+)', '2026-08-05', '2026-09-05', 90);

INSERT INTO public.bus_events (bus_id, event_type, to_status, detail)
SELECT id, 'CREATED', status, 'Imported from depot inventory' FROM public.buses;