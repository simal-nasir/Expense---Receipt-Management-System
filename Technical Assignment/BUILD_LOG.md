# Build Log

## Project

ExpenseFlow is an expense and receipt management system with a React Native mobile application and Django REST API backend.

## What I Built

I implemented:

* JWT authentication and role-based access for Employees, Managers, and Admins
* Employee expense creation, editing, deletion, searching and filtering
* Receipt upload and validation
* Receipt OCR processing using Celery, Redis and Tesseract
* Employee and Manager dashboards
* Manager expense approval and rejection with rejection reasons
* REST API documentation using Swagger
* Backend automated tests
* Backend linting with Ruff
* GitHub Actions CI pipeline

## Development Process

I first set up the Django backend and React Native application, then implemented authentication and expense management. After that, I added receipt processing, manager workflows, dashboards, testing, linting, CI/CD, and documentation.

I tested the APIs using Swagger/Insomnia and tested the main mobile workflows manually.

## AI Usage

I used ChatGPT as a development assistant for understanding requirements, generating and improving code, debugging errors, and writing documentation.

I did not blindly use generated code. I reviewed the code, modified it for my project, and tested the results.

One example was the manager rejection workflow. An AI-suggested implementation used `Alert.prompt()`, which did not work in my React Native environment. I investigated the issue and replaced it with a cross-platform `Modal` and `TextInput`.

## Validation

I verified the project using:

* Django automated tests
* `python manage.py check`
* `ruff check .`
* `npx expo-doctor`
* Swagger/Insomnia API testing
* Manual mobile testing of employee and manager workflows

## Known Limitations

PostgreSQL, Docker, production deployment, automated mobile tests, and some production security/scaling features were not completed within the assignment timebox. These are documented in the README as future improvements.
