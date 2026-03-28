# Security Architecture — Auth and Roles

## Current Scope
No login required (assignment constraint)

## Simulated Users
- Seed users in database
- Assign cards to users

---

## Future Authentication Design

### Authentication
- JWT-based authentication
- Token stored in HTTP-only cookies

### Authorization

Roles:
- Admin
- Member

Permissions:
- Admin: full access
- Member: limited actions

---

## Security Measures
- Input validation
- SQL injection prevention (parameterized queries)
- Rate limiting (future)
- HTTPS (deployment)

