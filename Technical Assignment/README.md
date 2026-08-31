# ExpenseFlow — Expense & Receipt Management System

A production-oriented mobile and backend expense management system that allows employees to create, manage, and submit business expenses with receipt uploads and OCR processing. Managers and administrators can review, approve, or reject submitted expenses and view expense analytics.

## Project Overview

ExpenseFlow was developed as part of a Technical Engineering Assignment for a Software Engineer — Mobile / Backend role.

The system consists of:

- A React Native mobile application
- A Django REST Framework backend
- SQLite database for local development
- JWT-based authentication
- Role-based authorization
- Expense management
- Receipt upload
- Asynchronous OCR processing using Celery and Redis
- Employee and Manager dashboards
- Swagger/OpenAPI API documentation

---

# Features

## Authentication

- User login using email and password
- JWT access and refresh tokens
- Protected API endpoints
- Role-based access control
- Employee, Manager, and Admin roles

## Employee Features

Employees can:

- Log in to the mobile application
- View their expenses
- Create expenses
- Select expense categories
- Enter amount, currency, description, and date
- Upload receipt images
- Submit expenses for approval
- View expense status
- View employee expense dashboard
- Search and filter expenses

Supported expense statuses:

- `DRAFT`
- `SUBMITTED`
- `APPROVED`
- `REJECTED`

## Manager Features

Managers can:

- View expense statistics
- View pending expense approvals
- Approve submitted expenses
- Reject submitted expenses
- Provide a rejection reason
- View total approved expense amounts
- View employee and expense statistics

Managers cannot approve or reject their own expenses.

## Receipt Processing

Employees can upload receipt images.

Uploaded receipts are processed asynchronously using:

- Celery
- Redis
- Tesseract OCR

OCR processing extracts text from the uploaded receipt and stores the extracted text with the expense.

Supported receipt formats:

- JPG
- JPEG
- PNG

Maximum receipt size:

- 5 MB

## Expense Categories

Expenses can be assigned to predefined categories.

The mobile application retrieves available categories from the backend and allows the employee to select a category while creating an expense.

## Expense Dashboard

### Employee Dashboard

The employee dashboard provides:

- Total expenses
- Current month expenses
- Approved expenses
- Pending expenses
- Rejected expenses

### Manager Dashboard

The manager dashboard provides:

- Total employees
- Total expenses
- Pending approvals
- Approved expenses
- Rejected expenses
- Total approved expense amount

---

# Technology Stack

## Mobile Application

- React Native
- Expo
- JavaScript
- React Navigation
- Expo Image Picker
- React Native DateTimePicker

## Backend

- Python
- Django
- Django REST Framework
- Django Filters
- Simple JWT

## Database

- SQLite
- Django ORM

SQLite is used for the current local development implementation to keep the project lightweight and easy to run without additional database configuration.

## Asynchronous Processing

- Celery
- Redis
- Tesseract OCR
- Pytesseract
- Pillow

## API Documentation

- OpenAPI
- Swagger UI

## Development Tools

- Git
- GitHub
- Insomnia
- macOS

---

# Project Structure

```text
Technical Assignment/
│
├── Backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── celery.py
│   │   └── ...
│   │
│   ├── expenses/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── tasks.py
│   │   ├── permissions.py
│   │   └── ...
│   │
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
│
├── Mobile-App/
│   ├── screens/
│   │   ├── SplashScreen.js
│   │   ├── LoginScreen.js
│   │   ├── ExpenseListScreen.js
│   │   ├── AddExpenseScreen.js
│   │   └── ...
│   │
│   ├── App.js
│   ├── package.json
│   └── ...
│
├── README.md
└── .gitignore