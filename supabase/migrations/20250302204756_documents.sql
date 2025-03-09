create extension if not exists pg_net with schema extensions;
create extension if not exists vector with schema extensions;

create table documents (
  id bigint primary key generated always as identity,
  name text not null,
  storage_object_id uuid not null references storage.objects (id),
  created_by uuid not null references auth.users (id) default auth.uid(),
  created_at timestamp with time zone not null default now()
);

create view documents_with_storage_path
with (security_invoker=true)
as
  select documents.*, storage.objects.name as storage_object_path
  from documents
  join storage.objects
    on storage.objects.id = documents.storage_object_id;

create table document_sections (
  id bigint primary key generated always as identity,
  document_id bigint not null references documents (id),
  content text not null,
  embedding vector (384),
  metadata jsonb not null default '{}'
);

alter table document_sections
drop constraint document_sections_document_id_fkey,
add constraint document_sections_document_id_fkey
  foreign key (document_id)
  references documents(id)
  on delete cascade;

create index on document_sections using hnsw (embedding vector_ip_ops);

alter table documents enable row level security;
alter table document_sections enable row level security;

create policy "Users can insert documents"
on documents for insert to authenticated with check (
  auth.uid() = created_by
);

create policy "Users can query their own documents"
on documents for select to authenticated using (
  auth.uid() = created_by
);

create policy "Users can insert document sections"
on document_sections for insert to authenticated with check (
  document_id in (
    select id
    from documents
    where created_by = auth.uid()
  )
);

create policy "Users can update their own document sections"
on document_sections for update to authenticated using (
  document_id in (
    select id
    from documents
    where created_by = auth.uid()
  )
) with check (
  document_id in (
    select id
    from documents
    where created_by = auth.uid()
  )
);

create policy "Users can query their own document sections"
on document_sections for select to authenticated using (
  document_id in (
    select id
    from documents
    where created_by = auth.uid()
  )
);
