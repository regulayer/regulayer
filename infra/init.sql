-- Create users
CREATE USER recorder WITH PASSWORD 'recorder_password';
CREATE USER control WITH PASSWORD 'control_password';
CREATE USER governance WITH PASSWORD 'governance_password';
CREATE USER incidents WITH PASSWORD 'incidents_password';

-- Create databases
CREATE DATABASE regulayer_recorder OWNER recorder;
CREATE DATABASE regulayer_control OWNER control;
CREATE DATABASE regulayer_governance OWNER governance;
CREATE DATABASE regulayer_incidents OWNER incidents;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE regulayer_recorder TO recorder;
GRANT ALL PRIVILEGES ON DATABASE regulayer_control TO control;
GRANT ALL PRIVILEGES ON DATABASE regulayer_governance TO governance;
GRANT ALL PRIVILEGES ON DATABASE regulayer_incidents TO incidents;
