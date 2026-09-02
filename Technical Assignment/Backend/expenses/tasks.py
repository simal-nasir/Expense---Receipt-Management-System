from celery import shared_task
import pytesseract
from PIL import Image


@shared_task
def process_receipt_ocr(expense_id):
    from .models import Expense

    try:
        expense = Expense.objects.get(id=expense_id)
    except Expense.DoesNotExist:
        return "Expense not found"

    if not expense.receipt:
        return "No receipt uploaded"

    try:
        with expense.receipt.open("rb") as image_file:
            image = Image.open(image_file)
            text = pytesseract.image_to_string(image)

        expense.ocr_text = text
        expense.save(update_fields=["ocr_text", "updated_at"])

        return "OCR completed"

    except Exception as e:  # noqa: BLE001
        return f"OCR failed: {e!s}"
    