-- Création de la table pour les abonnés à la newsletter
create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true
);

-- Sécurité (RLS - Row Level Security)
alter table public.newsletter_subscribers enable row level security;

-- Politique : Tout le monde peut s'inscrire (INSERT public)
create policy "Enable insert for everyone" 
on public.newsletter_subscribers 
for insert 
with check (true);

-- Politique : Seul l'admin (service role) peut voir les emails (SELECT)
-- On bloque la lecture publique pour éviter le scraping d'emails
create policy "Enable read access for service role only" 
on public.newsletter_subscribers 
for select 
using (auth.role() = 'service_role');
