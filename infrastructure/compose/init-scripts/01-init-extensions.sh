#!/bin/bash

# Enable PostGIS extension and Row Level Security
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Enable Row Level Security globally
    ALTER DATABASE "$POSTGRES_DB" SET row_security = on;
EOSQL

echo "PostGIS, pgcrypto, and uuid-ossp extensions enabled with RLS support"