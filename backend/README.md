# Backend

Express + MongoDB (Mongoose) + Cloudinary (image upload).

## Setup

```bash
cp .env.example .env   # phir .env me apni values bharo
npm install
npm run dev
```

## API

| Method | Route            | Description                                   |
|--------|------------------|-----------------------------------------------|
| GET    | /api/health      | Health check                                  |
| GET    | /api/items       | Saare items                                   |
| GET    | /api/items/:id   | Ek item                                       |
| POST   | /api/items       | Naya item (form-data: title, description, image) |
| PUT    | /api/items/:id   | Update (image optional, replace ho jaati hai) |
| DELETE | /api/items/:id   | Delete (Cloudinary se image bhi hat jaati hai)|
