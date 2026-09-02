from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import models
from django.utils import timezone

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .tasks import process_receipt_ocr

from .models import Expense, Category
from .serializers import (
    ExpenseSerializer,
    CategorySerializer,
    RejectExpenseSerializer,
)
from .permissions import IsManagerOrAdmin


class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "status",
        "category",
        "currency",
    ]

    search_fields = [
        "title",
        "description",
    ]

    ordering_fields = [
        "amount",
        "expense_date",
        "created_at",
    ]

    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user

        if user.role in ["MANAGER", "ADMIN"]:
            return Expense.objects.all()

        return Expense.objects.filter(user=user)

    def perform_create(self, serializer):
        expense = serializer.save(
            user=self.request.user
        )

        if expense.receipt:
            process_receipt_ocr.delay(expense.id)


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(
            user=self.request.user
        )


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class SubmitExpenseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            expense = Expense.objects.get(
                pk=pk,
                user=request.user
            )
        except Expense.DoesNotExist:
            return Response(
                {"detail": "Expense not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if expense.status != Expense.Status.DRAFT:
            return Response(
                {
                    "detail":
                    "Only draft expenses can be submitted."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        expense.status = Expense.Status.SUBMITTED
        expense.save()

        return Response(ExpenseSerializer(expense).data)


class ApproveExpenseView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsManagerOrAdmin
    ]

    def post(self, request, pk):
        try:
            expense = Expense.objects.get(pk=pk)
        except Expense.DoesNotExist:
            return Response(
                {"detail": "Expense not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if expense.user == request.user:
            return Response(
                {
                    "detail":
                    "You cannot approve your own expense."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if expense.status != Expense.Status.SUBMITTED:
            return Response(
                {
                    "detail":
                    "Only submitted expenses can be approved."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        expense.status = Expense.Status.APPROVED
        expense.rejection_reason = None
        expense.save()

        return Response(ExpenseSerializer(expense).data)


class RejectExpenseView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsManagerOrAdmin
    ]

    def post(self, request, pk):
        try:
            expense = Expense.objects.get(pk=pk)
        except Expense.DoesNotExist:
            return Response(
                {"detail": "Expense not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if expense.user == request.user:
            return Response(
                {
                    "detail":
                    "You cannot reject your own expense."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if expense.status != Expense.Status.SUBMITTED:
            return Response(
                {
                    "detail":
                    "Only submitted expenses can be rejected."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RejectExpenseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        expense.status = Expense.Status.REJECTED
        expense.rejection_reason = serializer.validated_data[
            "rejection_reason"
        ]
        expense.save()

        return Response(ExpenseSerializer(expense).data)
    
class EmployeeDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.filter(
            user=request.user
        )

        now = timezone.now()

        current_month_expenses = expenses.filter(
            expense_date__year=now.year,
            expense_date__month=now.month
        )

        return Response({
            "total_expenses": expenses.count(),

            "current_month": current_month_expenses.count(),

            "approved": expenses.filter(
                status=Expense.Status.APPROVED
            ).count(),

            "pending": expenses.filter(
                status=Expense.Status.SUBMITTED
            ).count(),

            "rejected": expenses.filter(
                status=Expense.Status.REJECTED
            ).count(),
        })

class ManagerDashboardView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsManagerOrAdmin
    ]

    def get(self, request):
        expenses = Expense.objects.all()

        return Response({
            "total_employees": expenses.values(
                "user"
            ).distinct().count(),

            "total_expenses": expenses.count(),

            "pending_approvals": expenses.filter(
                status=Expense.Status.SUBMITTED
            ).count(),

            "approved_expenses": expenses.filter(
                status=Expense.Status.APPROVED
            ).count(),

            "rejected_expenses": expenses.filter(
                status=Expense.Status.REJECTED
            ).count(),

            "total_amount": expenses.filter(
                status=Expense.Status.APPROVED
            ).aggregate(
                total=models.Sum("amount")
            )["total"] or 0,
        })