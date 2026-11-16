-- Device pairing for the family learning site. Additive only: new tables and new fl_* functions.
-- Existing tables, functions and saves are untouched.
create table if not exists learning.devices (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references learning.families(id) on delete cascade,
  label text not null default 'Device',
  pass_hash text not null,
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
create index if not exists devices_family_idx on learning.devices(family_id);
create table if not exists learning.pair_codes (
  code text primary key,
  family_id uuid not null references learning.families(id) on delete cascade,
  expires_at timestamptz not null,
  used boolean not null default false,
  tries int not null default 0
);
create index if not exists pair_codes_family_idx on learning.pair_codes(family_id);
alter table learning.devices enable row level security;
alter table learning.pair_codes enable row level security;
revoke all on learning.devices, learning.pair_codes from anon, authenticated, public;

-- device credential: "<device uuid>.<pass>"
create or replace function learning._dev_family(p_dev text)
returns uuid language plpgsql security definer set search_path to '' as $$
declare d uuid; ps text; f uuid;
begin
  if p_dev is null or p_dev !~ '^[0-9a-f-]{36}\.[0-9a-f]{64}$' then return null; end if;
  d := split_part(p_dev, '.', 1)::uuid; ps := split_part(p_dev, '.', 2);
  update learning.devices set last_seen = now()
   where id = d and pass_hash = encode(extensions.digest(ps, 'sha256'), 'hex')
   returning family_id into f;
  return f;
end $$;
revoke all on function learning._dev_family(text) from public, anon, authenticated;

create or replace function public.fl_pair_start(p_key text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare f uuid := learning._family(p_key); c text; i int := 0;
begin
  if f is null then return jsonb_build_object('ok', false, 'error', 'key'); end if;
  delete from learning.pair_codes where expires_at < now() - interval '1 day' or family_id = f;
  loop
    c := lpad((floor(random() * 1000000))::int::text, 6, '0');
    exit when not exists (select 1 from learning.pair_codes where code = c);
    i := i + 1; if i > 20 then return jsonb_build_object('ok', false, 'error', 'busy'); end if;
  end loop;
  insert into learning.pair_codes(code, family_id, expires_at) values (c, f, now() + interval '10 minutes');
  return jsonb_build_object('ok', true, 'code', c, 'expires_in', 600);
end $$;

create or replace function public.fl_pair_finish(p_code text, p_label text default 'Device')
returns jsonb language plpgsql security definer set search_path to '' as $$
declare r record; d uuid; ps text;
begin
  p_code := regexp_replace(coalesce(p_code, ''), '\D', '', 'g');
  select * into r from learning.pair_codes
   where code = p_code and not used and expires_at > now() for update;
  if r.code is null then
    -- a wrong guess uses up a try on every live code; 5 wrong guesses kill them
    update learning.pair_codes set tries = tries + 1, used = (tries + 1 >= 5)
     where not used and expires_at > now();
    return jsonb_build_object('ok', false, 'error', 'code');
  end if;
  if (select count(*) from learning.devices where family_id = r.family_id) >= 20 then
    return jsonb_build_object('ok', false, 'error', 'full'); end if;
  update learning.pair_codes set used = true where code = r.code;
  ps := encode(extensions.gen_random_bytes(32), 'hex');
  insert into learning.devices(family_id, label, pass_hash)
   values (r.family_id, left(coalesce(nullif(btrim(p_label), ''), 'Device'), 40), encode(extensions.digest(ps, 'sha256'), 'hex'))
   returning id into d;
  return jsonb_build_object('ok', true, 'device', d::text || '.' || ps);
end $$;

-- grown-ups' list of paired devices, from any paired device
create or replace function public.fl_dev_devices(p_dev text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare f uuid := learning._dev_family(p_dev);
begin
  if f is null then return jsonb_build_object('ok', false, 'error', 'device'); end if;
  return jsonb_build_object('ok', true, 'devices', coalesce((
    select jsonb_agg(jsonb_build_object('id', id, 'label', label, 'created', created_at, 'seen', last_seen) order by created_at)
    from learning.devices where family_id = f), '[]'::jsonb));
end $$;

create or replace function public.fl_dev_device_remove(p_dev text, p_device uuid)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare f uuid := learning._dev_family(p_dev);
begin
  if f is null then return jsonb_build_object('ok', false, 'error', 'device'); end if;
  delete from learning.devices where id = p_device and family_id = f;
  return jsonb_build_object('ok', true);
end $$;

-- a paired device can show a code to pair another one
create or replace function public.fl_dev_pair_start(p_dev text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare f uuid := learning._dev_family(p_dev); c text; i int := 0;
begin
  if f is null then return jsonb_build_object('ok', false, 'error', 'device'); end if;
  delete from learning.pair_codes where expires_at < now() - interval '1 day' or family_id = f;
  loop
    c := lpad((floor(random() * 1000000))::int::text, 6, '0');
    exit when not exists (select 1 from learning.pair_codes where code = c);
    i := i + 1; if i > 20 then return jsonb_build_object('ok', false, 'error', 'busy'); end if;
  end loop;
  insert into learning.pair_codes(code, family_id, expires_at) values (c, f, now() + interval '10 minutes');
  return jsonb_build_object('ok', true, 'code', c, 'expires_in', 600);
end $$;

create or replace function public.fl_dev_add_player(p_dev text, p_nickname text, p_avatar text default '🦊')
returns jsonb language plpgsql security definer set search_path to '' as $$
declare f uuid := learning._dev_family(p_dev); s text;
begin
  if f is null then return jsonb_build_object('ok', false, 'error', 'device'); end if;
  p_nickname := btrim(coalesce(p_nickname,''));
  if char_length(p_nickname) not between 1 and 24 then return jsonb_build_object('ok', false, 'error', 'name'); end if;
  s := trim(both '-' from regexp_replace(lower(p_nickname), '[^a-z0-9]+', '-', 'g'));
  if s = '' then s := 'player'; end if;
  if (select count(*) from learning.players where family_id = f) >= 8 then return jsonb_build_object('ok', false, 'error', 'full'); end if;
  insert into learning.players(family_id, slug, nickname, avatar) values (f, s, p_nickname, left(coalesce(p_avatar,'🦊'), 8))
  on conflict (family_id, slug) do nothing;
  return jsonb_build_object('ok', true, 'slug', s);
end $$;

-- a device may forget itself
create or replace function public.fl_dev_forget(p_dev text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare f uuid := learning._dev_family(p_dev);
begin
  if f is null then return jsonb_build_object('ok', false, 'error', 'device'); end if;
  delete from learning.devices where id = split_part(p_dev, '.', 1)::uuid;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.fl_dev_family(p_dev text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare f uuid := learning._dev_family(p_dev);
begin
  if f is null then return jsonb_build_object('ok', false, 'error', 'device'); end if;
  return jsonb_build_object('ok', true, 'players', coalesce((
    select jsonb_agg(jsonb_build_object('slug', p.slug, 'nickname', p.nickname, 'avatar', p.avatar,
      'games', coalesce((select jsonb_object_agg(g.game, g.updated_ms) from learning.progress g where g.player_id = p.id), '{}'::jsonb))
      order by p.created_at)
    from learning.players p where p.family_id = f), '[]'::jsonb));
end $$;

create or replace function public.fl_dev_load(p_dev text, p_player text, p_game text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare f uuid := learning._dev_family(p_dev); r record;
begin
  if f is null then return jsonb_build_object('ok', false, 'error', 'device'); end if;
  if not exists (select 1 from learning.players p where p.family_id = f and p.slug = p_player) then
    return jsonb_build_object('ok', false, 'error', 'player'); end if;
  select g.state, g.updated_ms into r from learning.progress g join learning.players p on p.id = g.player_id
   where p.family_id = f and p.slug = p_player and g.game = p_game;
  return jsonb_build_object('ok', true, 'state', r.state, 'updated', coalesce(r.updated_ms, 0));
end $$;

create or replace function public.fl_dev_save(p_dev text, p_player text, p_game text, p_state jsonb, p_updated bigint)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare f uuid := learning._dev_family(p_dev); pid uuid; cur bigint;
begin
  if f is null then return jsonb_build_object('ok', false, 'error', 'device'); end if;
  if p_game !~ '^[a-z0-9-]{1,40}$' then return jsonb_build_object('ok', false, 'error', 'game'); end if;
  if pg_column_size(p_state) > 1000000 then return jsonb_build_object('ok', false, 'error', 'size'); end if;
  select id into pid from learning.players where family_id = f and slug = p_player;
  if pid is null then return jsonb_build_object('ok', false, 'error', 'player'); end if;
  select updated_ms into cur from learning.progress where player_id = pid and game = p_game for update;
  if cur is not null and cur > coalesce(p_updated, 0) then
    return jsonb_build_object('ok', false, 'error', 'newer', 'updated', cur,
      'state', (select state from learning.progress where player_id = pid and game = p_game));
  end if;
  insert into learning.progress(player_id, game, state, updated_ms, saved_at) values (pid, p_game, p_state, coalesce(p_updated,0), now())
  on conflict (player_id, game) do update set state = excluded.state, updated_ms = excluded.updated_ms, saved_at = now();
  return jsonb_build_object('ok', true, 'updated', coalesce(p_updated,0));
end $$;

revoke all on function public.fl_pair_start(text), public.fl_pair_finish(text, text), public.fl_dev_pair_start(text), public.fl_dev_devices(text),
  public.fl_dev_device_remove(text, uuid), public.fl_dev_add_player(text, text, text), public.fl_dev_forget(text), public.fl_dev_family(text),
  public.fl_dev_load(text, text, text), public.fl_dev_save(text, text, text, jsonb, bigint) from public, authenticated;
grant execute on function public.fl_pair_start(text), public.fl_pair_finish(text, text), public.fl_dev_pair_start(text), public.fl_dev_devices(text),
  public.fl_dev_device_remove(text, uuid), public.fl_dev_add_player(text, text, text), public.fl_dev_forget(text), public.fl_dev_family(text),
  public.fl_dev_load(text, text, text), public.fl_dev_save(text, text, text, jsonb, bigint) to anon;
