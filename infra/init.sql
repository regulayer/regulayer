-- Create users
CREATE USER recorder WITH PASSWORD 'recorder_password';
CREATE USER control WITH PASSWORD 'control_password';
CREATE USER governance WITH PASSWORD 'governance_password';

-- Create databases
CREATE DATABASE regulayer_recorder OWNER recorder;
CREATE DATABASE regulayer_control OWNER control;
CREATE DATABASE regulayer_governance OWNER governance;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE regulayer_recorder TO recorder;
GRANT ALL PRIVILEGES ON DATABASE regulayer_control TO control;
GRANT ALL PRIVILEGES ON DATABASE regulayer_governance TO governance;
