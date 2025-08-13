# LifeSource API (NestJS + MongoDB)

A standalone backend for the LifeSource App. Tech: NestJS, MongoDB (Mongoose), JWT auth (RBAC), Swagger.

Setup
1) Copy .env.example to .env and set values:
   - MONGO_URI=your-mongo-uri
   - JWT_SECRET=your-jwt-secret
   - ADMIN_EMAIL=admin email to seed
   - ADMIN_PASSWORD=admin password to seed
2) npm install
3) npm run seed  # seeds the admin user
4) npm run start:dev

Swagger Docs
- http://localhost:3000/api/docs

Notes
- Do NOT commit real secrets. Use .env locally or platform secrets.
- Roles: admin | hospital | donor | recipient
- Admin creates and verifies hospitals. Donors/recipients can self-signup via /auth/signup.
