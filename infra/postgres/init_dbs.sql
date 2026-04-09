CREATE DATABASE regulayer_recorder;
CREATE DATABASE regulayer_control;
CREATE DATABASE regulayer_governance;
CREATE DATABASE regulayer_incidents;

\c regulayer_recorder
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c regulayer_control
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c regulayer_governance
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c regulayer_incidents
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
