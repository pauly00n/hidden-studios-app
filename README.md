## Hidden Studios App

Full stack web app with authentication, user data (name, bio) stored in Supabase with row level security, Fortnite.gg data scraping for predictions

## Setup:

Clone the repo.

Next create a Supabase project, 
create an `.env.local` file with the following environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
found from your Supabase project.

Use the following schema:
```SQL
create table public.profiles (
  id uuid references auth.users(id) primary key,
  display_name text,
  bio text check (char_length(bio) <= 200),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can select their own profile" on public.profiles
  for select using ( auth.uid() = id );
create policy "Users can insert/update their own profile" on public.profiles
  for all using ( auth.uid() = id );
```

## Methodology/Hurdles Overcome:

The Supabase/auth was not a big issue to get set up and working, but I did have some trouble figuring out how to create new rows off of sign ups, although that ended up being a simple upsert operation.

With the lack of an official API from [[https://fortnite.gg]], I had to scan the website's codebase and figure out their internal API calls. I was able to find the exact call ([[https://fortnite.gg/player-count-graph?range=1m&id="INSERT ID HERE"]]) for all the player usage data for any individual fortnite map.

However, the ID used was not simply the map code. It was a deterministic value in some lookup table that the fortnite.gg people hadn't explicitly left available, but a quick search:

```document.querySelector('[data-id]')?.dataset?.id```

was able to return the appropriate id to any map, given that this was was run in the console of [[https://fortnite.gg/island?code="INSERT CODE HERE"]]. 

The biggest challenge was figuring out how to get this value, using simple API routes caused cloudflare to intercept the request and ruined my efforts in fetching this simple damn ID. 

Ended up using [[https://scraperapi.com]] to bypass cloudflare and finally get access to the id, which enabled me to make the appropriate API requests and get access to the usage data of any fortnite map from fortnite.gg.

To forecast the data, I went for a simple time series seasonality model to accurately forecast how usage will look. This is much better than typical linear regression especially for ongoing user data, as we're able to capture recurring patterns in our prediction (i.e lower usage during school hours, late at night, more on weekends, etc).


