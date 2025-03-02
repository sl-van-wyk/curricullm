-- Create uuid_or_null function in private schema
create or replace function private.uuid_or_null(str text)
returns uuid
language plpgsql
as $$
begin
  return str::uuid;
  exception when invalid_text_representation then
    return null;
  end;
$$;

-- Drop the existing insert policy
drop policy if exists "Authenticated users can upload files" on storage.objects;

-- Create improved insert policy that requires UUID in the first path segment
create policy "Authenticated users can upload files"
on storage.objects for insert to authenticated with check (
  bucket_id = 'files' and
  owner = auth.uid() and
  private.uuid_or_null(path_tokens[1]) is not null
); 