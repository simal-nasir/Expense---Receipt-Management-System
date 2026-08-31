# ExpenseFlow — Expense & Receipt Management System

## Project Overview

ExpenseFlow is a mobile and backend expense management system developed as part of a Technical Engineering Assignment for a Software Engineer — Mobile / Backend role.

The system allows employees to create and manage business expenses, upload receipts, select expense categories, and submit expenses for approval. Managers and administrators can review submitted expenses, approve or reject them, and view expense statistics.

The project was developed within the recommended **2–3 working day timebox**. Features that could not reasonably be completed within the timebox are documented under **Known Limitations** and **Future Improvements**, together with how they would be implemented in a production environment.

### Main Components

- React Native mobile application
- Django REST Framework backend
- JWT authentication
- Role-based authorization
- Expense management
- Expense categories
- Receipt image upload
- Asynchronous OCR processing
- Celery + Redis
- Employee and Manager dashboards
- Expense approval/rejection workflow
- Swagger/OpenAPI API documentation
- Expense filtering, searching and ordering


---

# Features

## Authentication

- User login using email and password
- JWT access and refresh tokens
- Protected API endpoints
- Role-based access control
- Employee, Manager and Admin roles

## Employee Features

Employees can:

- Log in to the mobile application
- View their expenses
- Create expenses
- Select expense categories
- Enter amount and currency
- Add descriptions
- Select an expense date using a date picker
- Upload receipt images
- Submit expenses for approval
- View expense status
- View employee expense statistics
- Search and filter expenses

### Expense Statuses

- `DRAFT`
- `SUBMITTED`
- `APPROVED`
- `REJECTED`

## Manager Features

Managers can:

- View manager dashboard statistics
- View pending expense approvals
- Approve submitted expenses
- Reject submitted expenses
- Provide a rejection reason
- View approved expense totals
- View employee and expense statistics

Managers cannot approve or reject their own expenses.

## Receipt Processing

Employees can upload receipt images.

Uploaded receipts are processed asynchronously using:

- Celery
- Redis
- Tesseract OCR
- Pytesseract
- Pillow

OCR extracts text from uploaded receipts and stores the extracted text against the corresponding expense.

### Receipt Validation

- Supported formats: JPG, JPEG and PNG
- Maximum file size: 5 MB

## Expense Categories

Expenses can be assigned to predefined categories.

The mobile application retrieves available categories from the backend and allows employees to select a category while creating an expense.

## Search, Filtering and Ordering

The backend supports:

### Filtering

- Status
- Category
- Currency

### Search

- Expense title
- Description

### Ordering

- Amount
- Expense date
- Creation date

## Employee Dashboard

The employee dashboard provides:

- Total expenses
- Current month expenses
- Approved expenses
- Pending expenses
- Rejected expenses

## Manager Dashboard

The manager dashboard provides:

- Total employees
- Total expenses
- Pending approvals
- Approved expenses
- Rejected expenses
- Total approved expense amount


---

# Architecture

ExpenseFlow follows a client-server architecture.

```text
                    ┌──────────────────────────┐
                    │    React Native + Expo   │
                    │     Mobile Application   │
                    └────────────┬─────────────┘
                                 │
                                 │ REST API / JWT
                                 ▼
                    ┌──────────────────────────┐
                    │   Django REST Framework  │
                    │                          │
                    │ Authentication           │
                    │ Expense APIs             │
                    │ Category APIs             │
                    │ Dashboard APIs            │
                    │ Approval APIs             │
                    │ Receipt Upload            │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │         SQLite           │
                    │    Development Database  │
                    └──────────────────────────┘

              Receipt Upload / OCR Processing
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │      Celery Worker       │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │          Redis           │
                    │       Task Broker        │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │      Tesseract OCR       │
                    │    Receipt Text Extractor │
                    └──────────────────────────┘

Request Flow
The employee interacts with the React Native application.
The application sends authenticated REST API requests to Django.
Django REST Framework validates the request and JWT token.
Expense data is stored in the development database.
When a receipt is uploaded, a Celery task is created.
Redis acts as the Celery message broker.
The Celery worker processes the receipt using Tesseract OCR.
Extracted OCR text is stored against the expense.

Technology Stack
Mobile Application
React Native
Expo
JavaScript
React Navigation
Expo Image Picker
React Native DateTimePicker
Backend
Python
Django
Django REST Framework
Django Filters
Simple JWT
Database
SQLite for local development

PostgreSQL was planned as the production database according to the assignment requirements, but it was not configured within the available 2–3 day implementation timebox.

Asynchronous Processing
Celery
Redis
Tesseract OCR
Pytesseract
Pillow
API Documentation
OpenAPI
Swagger UI
Development Tools
Git
GitHub
Insomnia
macOS

Database Design

The application uses SQLite during local development.

The main database entities are:

User

The authentication user associated with each expense.

Important relationship:

User
  │
  └──< Expense

A user can have multiple expenses.

Category

Stores expense categories.

Fields:

id
name

Each category can be associated with multiple expenses.

Category
   │
   └──< Expense
Expense

The main business entity.

Important fields include:

id
user
category
title
amount
currency
description
receipt
ocr_text
merchant
ocr_date
ocr_total
expense_date
status
rejection_reason
created_at
updated_at
Relationships
User
 │
 └──────────────< Expense >────────────── Category
                       │
                       │
                       └── Receipt
                              │
                              ▼
                         OCR Processing

Production Database

For production deployment, PostgreSQL would replace SQLite.

The migration would involve:

Configure PostgreSQL credentials through environment variables.
Install the PostgreSQL database driver.
Update Django database configuration.
Run Django migrations.
Configure database backups.
Add connection pooling.
Secure database credentials using a secrets manager.
API Documentation

Interactive API documentation is available through Swagger/OpenAPI.

After starting the Django server, open:

http://127.0.0.1:8000/api/docs/

The exact Swagger URL depends on the URL configuration in the project.

The API provides endpoints for:

Authentication
POST /api/v1/auth/login/

Used to authenticate a user and obtain JWT access and refresh tokens.

Expenses
GET    /api/v1/expenses/
POST   /api/v1/expenses/
GET    /api/v1/expenses/<id>/
PUT    /api/v1/expenses/<id>/
PATCH  /api/v1/expenses/<id>/
DELETE /api/v1/expenses/<id>/
Categories
GET /api/v1/expenses/categories/
Submit Expense
POST /api/v1/expenses/<id>/submit/
Approve Expense
POST /api/v1/expenses/<id>/approve/
Reject Expense
POST /api/v1/expenses/<id>/reject/

Example request:

{
    "rejection_reason": "Receipt is missing or unclear."
}
Employee Dashboard
GET /api/v1/expenses/dashboard/employee/
Manager Dashboard
GET /api/v1/expenses/dashboard/manager/
Authentication

Protected endpoints require:

Authorization: Bearer <access_token>

The API was tested during development using Insomnia and the Swagger interface.


