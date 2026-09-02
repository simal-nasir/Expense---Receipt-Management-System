
from decimal import Decimal
from unittest.mock import patch
from PIL import Image
from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User
from .models import Expense, Category


class ExpenseAPITests(APITestCase):

    def setUp(self):
        """
        Create test users and common test data before every test.
        """

        self.employee = User.objects.create_user(
            username="employee",
            email="employee@test.com",
            password="TestPassword123",
            role=User.Role.EMPLOYEE,
        )

        self.employee2 = User.objects.create_user(
            username="employee2",
            email="employee2@test.com",
            password="TestPassword123",
            role=User.Role.EMPLOYEE,
        )

        self.manager = User.objects.create_user(
            username="manager",
            email="manager@test.com",
            password="TestPassword123",
            role=User.Role.MANAGER,
        )

        self.admin = User.objects.create_user(
            username="admin",
            email="admin@test.com",
            password="TestPassword123",
            role=User.Role.ADMIN,
        )

        self.category = Category.objects.create(
            name="Food"
        )

        self.expense = Expense.objects.create(
            user=self.employee,
            category=self.category,
            title="Lunch",
            amount=Decimal("1500.00"),
            currency="PKR",
            description="Business lunch",
            expense_date="2026-08-29",
            status=Expense.Status.DRAFT,
        )

    # ---------------------------------------------------------
    # 1. AUTHENTICATION
    # ---------------------------------------------------------

    def test_unauthenticated_user_cannot_access_expenses(self):
        """
        Users who are not logged in should not access expenses.
        """

        url = reverse("expense-list-create")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    # ---------------------------------------------------------
    # 2. EXPENSE CREATION
    # ---------------------------------------------------------

    def test_employee_can_create_expense(self):
        """
        An authenticated employee can create an expense.
        """

        self.client.force_authenticate(
            user=self.employee
        )

        url = reverse("expense-list-create")

        data = {
            "title": "Taxi",
            "amount": "800.00",
            "currency": "PKR",
            "description": "Taxi to client meeting",
            "category": self.category.id,
            "expense_date": "2026-08-29",
        }

        response = self.client.post(
            url,
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertEqual(
            Expense.objects.filter(
                user=self.employee
            ).count(),
            2
        )

    # ---------------------------------------------------------
    # 3. EXPENSE VALIDATION
    # ---------------------------------------------------------

    def test_expense_amount_must_be_greater_than_zero(self):
        """
        Expenses with zero or negative amounts should be rejected.
        """

        self.client.force_authenticate(
            user=self.employee
        )

        url = reverse("expense-list-create")

        data = {
            "title": "Invalid Expense",
            "amount": "0",
            "currency": "PKR",
            "description": "Invalid amount",
            "category": self.category.id,
            "expense_date": "2026-08-29",
        }

        response = self.client.post(
            url,
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertIn(
            "amount",
            response.data
        )

    # ---------------------------------------------------------
    # 4. EXPENSE PERMISSIONS
    # ---------------------------------------------------------

    def test_employee_cannot_access_another_employees_expense(self):
        """
        Employees should only be able to access their own expenses.
        """

        self.client.force_authenticate(
            user=self.employee2
        )

        url = reverse(
            "expense-detail",
            kwargs={"pk": self.expense.id}
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    # ---------------------------------------------------------
    # 5. MANAGER APPROVAL
    # ---------------------------------------------------------

    def test_manager_can_approve_submitted_expense(self):
        """
        A manager can approve an employee's submitted expense.
        """

        self.expense.status = Expense.Status.SUBMITTED
        self.expense.save()

        self.client.force_authenticate(
            user=self.manager
        )

        url = reverse(
            "expense-approve",
            kwargs={"pk": self.expense.id}
        )

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.expense.refresh_from_db()

        self.assertEqual(
            self.expense.status,
            Expense.Status.APPROVED
        )

    # ---------------------------------------------------------
    # 6. REJECTION
    # ---------------------------------------------------------

    def test_manager_can_reject_expense_with_reason(self):
        """
        A manager can reject a submitted expense
        and provide a rejection reason.
        """

        self.expense.status = Expense.Status.SUBMITTED
        self.expense.save()

        self.client.force_authenticate(
            user=self.manager
        )

        url = reverse(
            "expense-reject",
            kwargs={"pk": self.expense.id}
        )

        response = self.client.post(
            url,
            {
                "rejection_reason": "Receipt is not readable."
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.expense.refresh_from_db()

        self.assertEqual(
            self.expense.status,
            Expense.Status.REJECTED
        )

        self.assertEqual(
            self.expense.rejection_reason,
            "Receipt is not readable."
        )

    # ---------------------------------------------------------
    # 7. FILTERING
    # ---------------------------------------------------------

    def test_expenses_can_be_filtered_by_status(self):
        """
        The API should support filtering expenses by status.
        """

        self.expense.status = Expense.Status.SUBMITTED
        self.expense.save()

        self.client.force_authenticate(
            user=self.employee
        )

        url = reverse("expense-list-create")

        response = self.client.get(
            url,
            {"status": "SUBMITTED"}
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        results = response.data.get(
            "results",
            response.data
        )

        self.assertTrue(
            all(
                expense["status"] == "SUBMITTED"
                for expense in results
            )
        )

    # ---------------------------------------------------------
    # 8. PAGINATION
    # ---------------------------------------------------------

    def test_expenses_are_paginated(self):
        """
        The expense API should return paginated results.
        """

        for i in range(12):
            Expense.objects.create(
                user=self.employee,
                category=self.category,
                title=f"Expense {i}",
                amount=Decimal("100.00"),
                currency="PKR",
                expense_date="2026-08-29",
                status=Expense.Status.DRAFT,
            )

        self.client.force_authenticate(
            user=self.employee
        )

        url = reverse("expense-list-create")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertIn(
            "results",
            response.data
        )

        self.assertIn(
            "count",
            response.data
        )

        self.assertLessEqual(
            len(response.data["results"]),
            10
        )

    # ---------------------------------------------------------
    # 9. RECEIPT UPLOAD
    # ---------------------------------------------------------

    def test_employee_can_upload_receipt(self):
        """
        An employee can create an expense with a receipt image.
        """

        self.client.force_authenticate(
            user=self.employee
        )

        receipt = self.create_test_image()

        url = reverse("expense-list-create")

        data = {
            "title": "Receipt Expense",
            "amount": "2500.00",
            "currency": "PKR",
            "description": "Expense with receipt",
            "category": self.category.id,
            "expense_date": "2026-08-29",
            "receipt": receipt,
        }

        # Mock OCR so this test does not require
        # Celery/Redis/Tesseract to be running.
        with patch(
            "expenses.views.process_receipt_ocr.delay"
        ):
            response = self.client.post(
                url,
                data,
                format="multipart"
            )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        created_expense = Expense.objects.get(
            title="Receipt Expense"
        )

        self.assertTrue(
            bool(created_expense.receipt)
        )
        
    def create_test_image(self):
        image = Image.new(
            "RGB",
            (100, 100),
            color="white"
        )

        image_file = BytesIO()

        image.save(
            image_file,
            format="JPEG"
        )

        image_file.seek(0)

        return SimpleUploadedFile(
            "receipt.jpg",
            image_file.read(),
            content_type="image/jpeg"
        )

    # ---------------------------------------------------------
    # 10. OCR WORKFLOW
    # ---------------------------------------------------------

    @patch("expenses.tasks.pytesseract.image_to_string")
    def test_ocr_workflow_updates_expense(self, mock_ocr):
        """
        OCR should read receipt text and save it
        to the expense.
        """

        mock_ocr.return_value = (
            "Restaurant ABC\n"
            "Total: PKR 1500"
        )

        receipt = self.create_test_image()
        
        self.expense.receipt.save(
            "receipt.jpg",
            receipt,
            save=True
        )

        from .tasks import process_receipt_ocr

        # Run the Celery task function directly for testing.
        result = process_receipt_ocr(
            self.expense.id
        )

        self.expense.refresh_from_db()

        self.assertEqual(
            result,
            "OCR completed"
        )

        self.assertEqual(
            self.expense.ocr_text,
            "Restaurant ABC\nTotal: PKR 1500"
        )

