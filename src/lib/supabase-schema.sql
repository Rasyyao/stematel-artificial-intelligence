-- Enable UUID
create extension if not exists "uuid-ossp";

-- Datasets table
create table if not exists datasets (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null default 'General',
  description text not null default '',
  file_path text not null,
  file_size bigint not null default 0,
  file_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Submissions table
create table if not exists submissions (
  id uuid primary key default uuid_generate_v4(),
  student_name text not null,
  title text not null,
  dataset_id uuid references datasets(id) on delete set null,
  notes text,
  file_path text not null,
  file_name text not null,
  file_size bigint not null default 0,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'good', 'needs_improvement')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reviews table
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references submissions(id) on delete cascade,
  comment text not null,
  status text not null check (status in ('pending', 'reviewed', 'good', 'needs_improvement')),
  created_at timestamptz not null default now()
);

-- Announcements table
create table if not exists announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS
alter table datasets enable row level security;
alter table submissions enable row level security;
alter table reviews enable row level security;
alter table announcements enable row level security;

-- Read policies (public)
create policy "Public read datasets" on datasets for select using (true);
create policy "Public read announcements" on announcements for select using (true);
create policy "Public read submissions" on submissions for select using (true);
create policy "Public read reviews" on reviews for select using (true);

-- Write policies (all operations go through server-side API routes that enforce admin auth)
create policy "Allow insert datasets" on datasets for insert with check (true);
create policy "Allow update datasets" on datasets for update using (true);
create policy "Allow delete datasets" on datasets for delete using (true);

create policy "Allow insert submissions" on submissions for insert with check (true);
create policy "Allow update submissions" on submissions for update using (true);

create policy "Allow insert reviews" on reviews for insert with check (true);

create policy "Allow insert announcements" on announcements for insert with check (true);
create policy "Allow delete announcements" on announcements for delete using (true);
