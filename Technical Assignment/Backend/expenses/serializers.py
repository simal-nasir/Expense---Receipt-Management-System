from rest_framework import serializers
from .models import Expense, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = Expense
        fields = [
            "id",
            "user",
            "title",
            "amount",
            "currency",
            "category",
            "category_name",
            "description",
            "receipt",
            "ocr_text",
            "merchant",
            "ocr_date",
            "ocr_total",
            "expense_date",
            "status",
            "rejection_reason",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "status",
            "rejection_reason",
            "ocr_text",
            "merchant",
            "ocr_date",
            "ocr_total",
            "created_at",
            "updated_at",
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than zero."
            )
        return value
    
    def validate_receipt(self, value):
        max_size = 5 * 1024 * 1024  # 5MB

        if value.size > max_size:
            raise serializers.ValidationError(
                "Receipt file size cannot exceed 5MB."
            )

        allowed_types = [
            "image/jpeg",
            "image/png",
            "image/jpg",
        ]

        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Only JPG and PNG images are allowed."
            )

        return value

class RejectExpenseSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=True)

    def validate_rejection_reason(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Rejection reason cannot be empty."
            )
        return value