# AI-Assisted Development

I used **ChatGPT** during the development of ExpenseFlow. I used AI as a development assistant, but I reviewed and tested the code before using it in the project.

## 1. AI Tool Used

* ChatGPT

## 2. What I Used AI For

I used ChatGPT for:

* Understanding assignment requirements
* Planning the application structure
* Writing and improving some code
* Debugging errors
* Understanding Django, DRF, React Native, Celery, Redis, and GitHub Actions
* Improving the README and documentation

## 3. Important Prompts / Approaches

Some of my prompts were based on specific problems I faced, such as:

* "How can I implement this feature in Django REST Framework?"
* "Why am I getting this error and how can I fix it?"
* "How should I implement this manager approval/rejection workflow?"
* "Help me set up GitHub Actions for Django and React Native."
* "Explain this code and tell me what I need to change."

I usually provided the error, existing code, or requirement and then used the response to understand and implement the solution.

## 4. Code Generated

AI helped generate or suggest parts of:

* Django REST API code
* React Native UI and navigation code
* Validation and error-handling code
* Celery/OCR implementation structure
* GitHub Actions CI workflow
* Ruff configuration

## 5. What I Modified

I modified the generated code according to my project structure and requirements. I also fixed issues that appeared during implementation and adjusted the UI and API behaviour after testing.

## 6. Bugs Introduced / Found

One issue was using `Alert.prompt()` for the manager rejection reason. It was not supported in the React Native environment I was using, so I replaced it with a `Modal` and `TextInput`.

AI-assisted code also required linting and cleanup. Ruff initially reported several issues, which I fixed and verified.

## 7. How I Verified the Code

I verified the implementation by:

* Running the Django development server
* Testing APIs using Swagger and Insomnia
* Testing the mobile application manually
* Running `python manage.py test`
* Running `python manage.py check`
* Running `ruff check .`
* Running `npx expo-doctor`
* Testing the main employee and manager workflows manually

AI was used to help me develop and debug the application, but I remained responsible for understanding, modifying, testing, and validating the submitted code.
