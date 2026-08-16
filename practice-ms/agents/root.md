---
Name: Root AI Agent file
Descriptions: Read this file for guidance, descriptions about this `practice-ms` repository.
---
**Descriptions**:
- This is a Microservice HRM SaaS multi-tenants project.
- ERD Diagram: `practices/practice-ms/agents/docs/erd`.

**Technical stack:**
- Framework: Nest.js (Express.js based), Gin (golang), Nginx.
- Data: Pgsql, prisma (ORM).
- Testing: Jest.
- DevOps: Docker, AWS.

**Business domain:**
- Descriptions:
	- System allow agencies (companies) create their own internal recruiting process with dynamic inputs and forms.
	- Each input and form can have chaining logic built dynamically by agencies.
		- Example: Job related to Sale, change Job -> change Sale information (add/delete input inside Sale).
- Agency: Build forms, chaining logic.
- Staff: Submit Resume, custom forms, apply jobs.
- Basic forms:
	- Resume: Name, Skill, Description
	- Job: Name, Skill, Description
	- Staff: Name, Resume, Job, Company
	- Sale: Name, Resume, Job, Company

**Microservice descriptions:**
- The microservice (MS) using gRPC for service communication.
- Every requests will go through gateway.
- Services structure:
	- `repo-core`: The CRM (core) system that manage all fields.
		- Tech: Golang.
	- `repo-api`: Higher layer to build forms, staffs, agencies, consuming fields from core.
		- Tech: Nest.js.
	- `repo-remote`: Managing all configurations of system like database migration, protobuf, dockerizing (compose, etc), aws cdk, etc.
	- `repo-gateway`: API gateway for clients.
		- Tech: Nginx.
