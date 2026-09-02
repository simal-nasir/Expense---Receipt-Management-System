# ExpenseFlow — Expense & Receipt Management System

## Project Overview
ExpenseFlow is a full-stack expense and receipt management system designed to help employees record, manage, and submit business expenses while allowing managers to review, approve, or reject expense claims.

The system mobile application is made using React Native javascript and Django REST Framework for backend. It supports JWT-based authentication, role-based access control, expense management, receipt uploads, expense approval workflows, search and filtering, and management dashboards.

The backend provides a RESTful API for authentication, expenses, categories, receipt processing, manager actions, and dashboard statistics. The mobile application provides separate experiences for employees and managers based on their assigned roles.

### User Roles

* **Employee** — Create and manage expenses, upload receipts, submit expenses for review, and view expense information.
* **Manager** — Review employee expenses, approve or reject submissions, provide rejection reasons, and view expense statistics.
* **Admin** — Manage users and system data through the Django administration interface.

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
```

Request Flow
The employee interacts with the React Native application.
The application sends authenticated REST API requests to Django.
Django REST Framework validates the request and JWT token.
Expense data is stored in the development database.
When a receipt is uploaded, a Celery task is created.
Redis acts as the Celery message broker.
The Celery worker processes the receipt using Tesseract OCR.
Extracted OCR text is stored against the expense.

# Technology Stack
## Mobile Application
React Native
Expo
JavaScript
React Navigation
Expo Image Picker
React Native DateTimePicker
## Backend
Python
Django
Django REST Framework
Django Filters
Simple JWT
Django Admin
drf-spectacular
## Database
SQLite for local development


PostgreSQL was planned as the production database according to the assignment requirements, but it was not configured during this implementation because I did not have prior hands-on experience with PostgreSQL. I plan to gain practical experience with PostgreSQL and migrate the application from SQLite in a future iteration

Asynchronous Processing
Celery
Redis
Tesseract OCR
Pytesseract
Pillow
## API Documentation
Swagger UI
## Development Tools
Git
GitHub
Insomnia
macOS

# Database Design

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
```text
User
 │
 └──────────────< Expense >────────────── Category
                       │
                       │
                       └── Receipt
                              │
                              ▼
                         OCR Processing
```


# API Documentation

Interactive API documentation is available through Swagger/OpenAPI.

After starting the Django server, open:

http://127.0.0.1:8000/api/docs/

The exact Swagger URL depends on the URL configuration in the project.

The API was tested during development using Insomnia and the Swagger interface.

# Setup Instructions
## Prerequisites

Make sure the following are installed on your system:

Python 3.11 or later
Node.js 20 or later
npm
Git
Expo CLI through the project dependencies
Tesseract OCR (required for receipt OCR processing)

1. Clone the Repository
git clone <your-github-repository-url>
cd "Technical Assignment"

2. Backend Setup

Navigate to the backend directory:

cd Backend

Create and activate a Python virtual environment:

macOS / Linux

python3 -m venv venv
source venv/bin/activate

Install the Python dependencies:

pip install -r requirements.txt

Create the environment file:

touch .env

Add the required environment variables to .env.

Example:

DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=

Run database migrations:

python manage.py migrate

Create an administrator account if required:

python manage.py createsuperuser

Start the Django development server:

python manage.py runserver

The backend API will be available at:

http://127.0.0.1:8000/

Swagger API documentation:

http://127.0.0.1:8000/api/docs/

3. Start Redis and Celery

If receipt OCR background processing is being used, Redis must be running.

Start the Celery worker from the Backend directory:

celery -A config worker --loglevel=info

Redis is expected to be available at:

redis://localhost:6379/0

4. Mobile Application Setup

Open a new terminal and navigate to the mobile application:

cd "Technical Assignment/Mobile-App"

Install the JavaScript dependencies:

npm install

Start the Expo development server:

npx expo start


5. Backend URL Configuration

The mobile application currently uses the local development backend:

http://127.0.0.1:8000

This configuration is intended for local development.


## Setup Limitations

The current setup is intended for local development.

SQLite is used instead of PostgreSQL.
Production cloud storage is not configured.
Production deployment is not included.
Docker-based setup is not currently provided.
Mobile API configuration currently uses a local development URL.

# Environment Variables

ExpenseFlow uses environment variables for configuration values and sensitive credentials. Secrets are stored in a local .env file and are not committed to the repository.

# Running Tests
## Backend Tests

The backend includes automated tests covering key API and business-logic functionality.

Navigate to the backend directory:
cd Backend

Run the Django test suite:

python manage.py test

The current test suite contains 10 automated backend tests covering the implemented backend functionality.

Backend Linting

Ruff is configured for automated Python code quality checks.

Run:

ruff check .

The project is expected to pass the Ruff checks before changes are committed.

Django System Checks

Run Django's built-in project validation:

python manage.py check

## Mobile Testing

Automated mobile application tests were not completed within the implementation timebox.

The mobile application was instead manually validated during development, including:

Login and registration
Employee expense workflows
Receipt upload
Search and filtering
Expense submission
Manager approval and rejection workflows
Dashboard functionality
Profile and logout

Mobile automated testing with Jest/React Native Testing Library is a planned future improvement.

## Test Limitations

The current automated test coverage is primarily focused on the backend. Mobile automated tests, full end-to-end testing, and comprehensive integration testing across the mobile application, API, database, and background OCR processing were not completed within the available implementation timebox.

# Running with Docker

Docker and Docker Compose were not implemented in the current version of ExpenseFlow.

I did not have sufficient hands-on experience with Docker and Docker Compose before starting this assignment. Given the available implementation time, I decided not to introduce Docker configuration without being able to properly validate and troubleshoot the complete containerized setup.

The application can currently be run locally using the Django development server, SQLite, Redis/Celery, and the React Native/Expo development environment as described in the Setup Instructions.

Docker and Docker Compose are planned as a future improvement. The intended containerized setup would include separate services for the Django backend, PostgreSQL database, Redis, and Celery worker, with appropriate environment-based configuration.

# CI/CD

ExpenseFlow uses GitHub Actions for continuous integration.

The CI workflow is triggered on:

Pushes to the main or master branch
Pull requests targeting the main or master branch

## CI Pipeline

The workflow performs the following checks:

### Backend
Sets up Python 3.11
Installs backend dependencies
Runs Django system checks
Runs Ruff linting
Runs the automated Django test suite

### Mobile
Sets up Node.js 20
Installs dependencies using npm ci
Runs Expo Doctor to validate the Expo project
Builds/exports the Expo application for web to verify the project can be compiled successfully

## Workflow

The GitHub Actions workflow is located at:

.github/workflows/ci.yaml

## CI/CD Limitations

The current implementation focuses on continuous integration and automated validation. Automatic deployment to a production environment has not been implemented.

Production deployment, automated mobile builds/releases, and deployment to cloud infrastructure are planned as future improvements.

# Security Considerations

Security was considered throughout the implementation of ExpenseFlow, particularly around authentication, authorization, input validation, file uploads, and secret management.

## Implemented Security Measures

* **Password Hashing:** User passwords are handled through Django's authentication system, which stores passwords using secure password hashing rather than plain text.
* **Authentication:** The REST API uses JWT-based authentication with access and refresh tokens. Protected endpoints require authentication.
* **Authorization:** Role-based permissions are implemented for Employee, Manager, and Admin users. Users can only perform actions allowed by their assigned role.
* **Input Validation:** Django REST Framework serializers validate incoming API data before it is processed or stored.
* **SQL Injection Protection:** Database operations use Django's ORM rather than manually constructed SQL queries, reducing the risk of SQL injection.
* **CORS:** `django-cors-headers` is configured to control cross-origin requests during development.
* **Receipt Upload Validation:** Receipt uploads are restricted to supported image formats (JPG/JPEG/PNG) with a maximum file size of 5 MB.
* **Secret Management:** Sensitive configuration such as the Django `SECRET_KEY` is loaded through environment variables. Real `.env` files are excluded from version control, while `.env.example` contains only placeholder values.
* **CSRF:** Django's built-in CSRF protection remains enabled for Django's browser-based functionality such as the admin interface. The REST API uses JWT authentication rather than cookie-based authentication.

## Security Considerations / Future Improvements

The following security improvements were considered but were not fully implemented within the assignment time:

* **Rate Limiting:** API throttling/rate limiting should be added to protect authentication and other endpoints from abuse.
* **Production CORS Configuration:** Allowed origins should be restricted to known production application domains rather than development configurations.
* **Secure HTTP Headers:** Production deployment should explicitly configure HTTPS, HSTS, secure cookies where applicable, and other security-related HTTP headers.
* **File Content Validation:** Receipt uploads could be further hardened by validating file contents/MIME types rather than relying only on file extensions and size limits.
* **Dependency Vulnerability Scanning:** Automated dependency vulnerability scanning such as `pip-audit` should be added to the CI pipeline.
* **Production Secret Management:** Cloud secret-management services should be used instead of local `.env` files for production deployments.
* **Token Storage:** The mobile application should use secure platform storage such as the iOS Keychain/Android Keystore for production token persistence.
* **Production Database:** PostgreSQL with appropriate database security and access controls should be used instead of SQLite for production.

# Known Limitations

The current version of ExpenseFlow was developed within the assignment time. The following limitations remain:

* **Database:** SQLite is currently used for local development. PostgreSQL was planned for production but was not configured due to limited prior hands-on experience with PostgreSQL.
* **Docker:** Docker and Docker Compose were not implemented. The application currently runs using local development services.
* **Production Deployment:** The application has not been deployed to a production cloud environment.
* **Cloud Storage:** Receipt files currently use local storage. AWS S3 or another production object-storage service has not been configured.
* **Mobile Automated Tests:** Automated Jest/React Native tests were not completed. Mobile functionality was manually tested instead.
* **End-to-End Testing:** Full end-to-end testing across the mobile application, API, database, Redis/Celery, and OCR pipeline has not been implemented.
* **API Rate Limiting:** Production API rate limiting/throttling has not been implemented.
* **Production Security:** Production HTTPS/HSTS configuration, secure production headers, and cloud-based secret management require further configuration.
* **Dependency Security Scanning:** Automated dependency vulnerability scanning has not yet been added to the CI pipeline.
* **Mobile Token Storage:** Production-grade secure token storage using platform-specific secure storage has not been implemented.
* **Mobile Type Safety:** The mobile application is written in JavaScript rather than TypeScript, so strict compile-time type checking is not available.
* **Form Validation Libraries:** Libraries such as React Hook Form and Zod were not introduced; validation is handled through the existing application and backend validation.
* **CI/CD Deployment:** GitHub Actions currently provides continuous integration and automated checks, but automatic production deployment has not been configured.
* **Observability:** Production monitoring, centralized logging, error tracking, and performance monitoring have not been configured.

These limitations represent areas for future improvement rather than missing core functionality. The implemented system provides the main expense management, receipt processing, authentication, role-based workflow, employee dashboard, and manager approval functionality required by the assignment.

# Debugging Challenge

## Bug 1 — Manager App Crashes When Rejecting an Expense

**Problem:**
The Manager Dashboard crashed when a manager tried to reject an expense and enter a rejection reason.

**Symptoms:**
The Approve workflow worked, but tapping Reject caused the app to fail when requesting the rejection reason.

**Root Cause:**
The app used `Alert.prompt()`, which is not supported in the React Native environment being used.

**Investigation:**
The rejection API was tested independently through Swagger and worked correctly, confirming that the issue was on the mobile UI side.

**Solution:**
Replaced `Alert.prompt()` with a cross-platform `Modal` containing a `TextInput` for the rejection reason.

**Test Added:**
Manually tested the complete workflow: Reject → enter reason → submit → verify `REJECTED` status and updated dashboard statistics.

**Prevention:**
Used cross-platform React Native components and documented the workflow for future automated mobile testing.

---

## Bug 2 — Ruff Linting Errors in Backend

**Problem:**
The backend initially failed the Ruff linting check with multiple code-quality errors.

**Symptoms:**
Running `ruff check .` reported errors including unused imports, import-order issues, migration-related warnings, and a broad exception warning.

**Root Cause:**
Some files contained unused imports and formatting/lint issues from development. Ruff was also checking generated migration files.

**Investigation:**
Ran `ruff check .` and reviewed the reported file and line numbers to identify each issue.

**Solution:**
Removed unused imports, configured Ruff to exclude migration files and ignore non-critical existing rules, and added an explicit Ruff exception comment where the broad exception was intentional.

**Test Added:**
Re-ran `ruff check .` after the fixes.

**Prevention:**
Ruff is now included in the CI pipeline so linting errors are detected automatically before changes are accepted.

# Engineering Fundamentals

## Question 1 — What is the difference between authentication and authorization?

**Authentication** checks who the user is, for example by logging in with email and password.

**Authorization** checks what that user is allowed to do, based on their role or permissions.

---

## Question 2 — Why should business authorization be implemented on the backend instead of relying on the mobile application?

The mobile application can be modified or bypassed by a user. The backend is responsible for protecting the actual data and business rules, so authorization must be checked on the server.

For example, only a Manager should be able to approve or reject expenses.

---

## Question 3 — What is an HTTP 401 vs 403?

**401 Unauthorized:** The user is not authenticated or their token is invalid/missing.

**403 Forbidden:** The user is authenticated but does not have permission to perform the requested action.

---

## Question 4 — What is a database index and when can an index make performance worse?

A database index helps the database find records faster, especially when searching or filtering.

Too many indexes can make performance worse because they require extra storage and make insert, update, and delete operations slower.

---

## Question 5 — What is a database transaction?

A transaction groups multiple database operations together so they either all succeed or all fail.

**Example:** When an expense is approved, updating its status and related records should happen together. If one operation fails, the changes should be rolled back.

---

## Question 6 — Why should receipt processing use a background job?

OCR processing can take time and should not make the user wait for the API response.

Using Celery as a background job allows the receipt to be processed separately while the user continues using the application.

---

## Question 7 — What happens if the OCR worker crashes halfway through processing a receipt? How would you make the system reliable?

If the worker crashes, the OCR task may remain incomplete.

I would make the system more reliable by using **task retries**, tracking processing status, and making tasks **idempotent** so they can safely run again without creating duplicate results.

---

## Question 8 — What is the difference between unit, integration, and end-to-end testing?

**Unit testing:** Tests one small piece of code independently.

**Integration testing:** Tests whether multiple parts work correctly together, such as the API and database.

**End-to-end testing:** Tests the complete user workflow, such as creating an expense in the mobile app and approving it as a manager.

---

## Question 9 — What is caching? Where could caching be introduced in this system?

Caching stores frequently used data temporarily so it can be accessed faster without repeatedly querying the database.

In ExpenseFlow, caching could be used for **expense categories and dashboard statistics**, especially when the number of users increases.

---

## Question 10 — If the application grows from 1,000 to 1,000,000 users, what parts of your architecture would you reconsider?

I would reconsider the database, file storage, API scalability, background workers, caching, and monitoring.

I would move from SQLite to PostgreSQL, use cloud storage such as S3 for receipts, add more Celery workers, introduce Redis caching, and use load balancing and monitoring for the API.

# Scaling the System

The current ExpenseFlow architecture is suitable for a small application. If the number of users grows significantly, I would gradually introduce more scalable infrastructure instead of changing everything at once.

## 1,000 Users

At around 1,000 users, the current architecture can work with a Django API, database, Redis/Celery for background tasks, and local development storage.

For a production setup, I would use PostgreSQL instead of SQLite and object storage such as AWS S3 for receipt files.

I would also add basic monitoring, logging, API rate limiting, and regular database backups.

## 100,000 Users

At around 100,000 users, the API and database would receive much more traffic.

I would:

* Use PostgreSQL with proper indexing and query optimization.
* Add **Redis caching** for frequently requested data such as categories and dashboard information.
* Add **read replicas** for read-heavy database operations.
* Run multiple Django API instances behind a **load balancer**.
* Horizontally scale the API by adding more application servers when traffic increases.
* Increase the number of **Celery workers** for OCR and other background processing.
* Move receipt files to **object storage** such as S3 instead of storing them on the application server.
* Use a **CDN** for faster delivery of receipt images and other static files.
* Add stronger monitoring for API performance, database usage, Celery queues, and errors.
* Introduce rate limiting to protect the API from excessive traffic.
* Consider a dedicated search solution if expense searching becomes too large for normal database queries.

## 1,000,000+ Users

At this scale, I would need to reconsider almost every part of the architecture.

The application would need multiple API servers and services distributed across different regions. The database would likely require advanced partitioning/sharding strategies, multiple read replicas, and careful query optimization.

I would use Redis or another distributed caching system, a large pool of queue workers, and highly scalable object storage with a CDN for receipts.

For search, I would consider a dedicated distributed search system instead of relying only on PostgreSQL queries.

I would also need strong monitoring, centralized logging, alerting, rate limiting, load balancing, automated scaling, backups, disaster recovery, and security controls.

## Overall Approach

I would scale the system gradually based on actual traffic and bottlenecks. I would avoid adding complex infrastructure too early because it increases development and maintenance costs.

The main progression would be:

**1,000 users → PostgreSQL + object storage + monitoring**

**100,000 users → caching + read replicas + horizontal API scaling + more workers + CDN**

**1,000,000+ users → distributed infrastructure + database partitioning/sharding + multi-region scaling + dedicated search + advanced monitoring and reliability**

# Future Improvements

If I continued developing ExpenseFlow, I would focus on the following improvements:

* Migrate from SQLite to **PostgreSQL** for production use.
* Add **Docker and Docker Compose** for easier setup and deployment.
* Move receipt storage from local storage to **AWS S3 or similar object storage**.
* Improve OCR reliability with better error handling, retries, and processing status tracking.
* Add **automated mobile tests** and more end-to-end tests.
* Add API **rate limiting** and dependency vulnerability scanning.
* Improve mobile security by using secure storage for authentication tokens.
* Add production **monitoring, logging, and error tracking**.
* Add a dedicated search solution if the number of expenses becomes very large.
* Set up **automatic production deployment** through the CI/CD pipeline.
* Convert the mobile application to **TypeScript** for better type safety and maintainability.
* Improve the UI with better loading, error, and empty states.
* Add more detailed analytics and reporting for managers.
