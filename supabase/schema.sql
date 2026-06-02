-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create period_entries table
create table public.period_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  start_date text not null,
  end_date text not null,
  flow text not null check (flow in ('ringan', 'sedang', 'berat')),
  symptoms text[] default '{}'::text[] not null,
  mood text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for period_entries
alter table public.period_entries enable row level security;

create policy "Users can view their own period entries." on public.period_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert their own period entries." on public.period_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own period entries." on public.period_entries
  for update using (auth.uid() = user_id);

create policy "Users can delete their own period entries." on public.period_entries
  for delete using (auth.uid() = user_id);

-- Create wellness_logs table
create table public.wellness_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date text not null,
  water integer default 0 not null,
  sleep numeric default 0 not null,
  exercise integer default 0 not null,
  mood text,
  energy integer default 0 not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, date)
);

-- Enable RLS for wellness_logs
alter table public.wellness_logs enable row level security;

create policy "Users can view their own wellness logs." on public.wellness_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own wellness logs." on public.wellness_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own wellness logs." on public.wellness_logs
  for update using (auth.uid() = user_id);

create policy "Users can delete their own wellness logs." on public.wellness_logs
  for delete using (auth.uid() = user_id);

-- Create a trigger to automatically create a profile for new auth users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
