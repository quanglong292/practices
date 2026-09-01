---
Name: Root AI Agent file
Descriptions: Read this file for guidance, descriptions about this `practice-ms` repository.
---

**Overview**:

- This is a Microservice (MS) CRM with backend-for-frontend (BFF) pattern.
- ERD Diagram: `agents/docs/erd.md`
- Authentication Diagram: `agents/docs/authentication_diagram.md`

**Technical stack:**

- Framework: Nest.js (Express.js based), Express.js, gRPC, Nginx.
- Data: Pgsql, prisma (ORM).
- Testing: Jest.
- DevOps: Docker, AWS.

**Business domain descriptions:**
- Dynamic fields CRM system for HRM apps.
- The `field` will configure by structure: `<type>_<field alias>`.
	- `type` can be anything, create by agencies.
	- `field` alias is anything in `string`, create by agencies.
- Splitted into 2 repositories: `api` and `core`.
	- `core` is the CRM managing `fields` and `resources`, and it has it own database (`core-db`).
	- `api` is the BFF layer consuming fields from CRM to create features for agencies (agencies are tenants), it also managing multi-tenant databases (each tenant = each database).

**Microservice architecture:**
- The MS using gRPC for service communication.
- The spillting service rule following domain-driven-architecture (Uber-like).
	- Every requests will go through gateway.
- Services structure:
  - `repo-core`: The CRM (core) system that manage `fields` and `resources`.
    - Tech: Express.js.
  - `repo-api`: Higher layer to build forms, staffs, agencies, consuming fields from core.
    - Tech: Nest.js.
  - `repo-remote`: Managing all configurations of system like database migration, protobuf, dockerizing (compose, etc), aws cdk, etc.
  - `repo-gateway`: API gateway for clients.
    - Tech: Nginx.
- The communication configuration:
	- `api, core, gateway` can communication with bidirectional.
		- Example: api can call core to get fields, or gateway can call core to get fields, as long as the route is matching.
