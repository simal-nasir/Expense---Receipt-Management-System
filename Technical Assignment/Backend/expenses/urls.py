from django.urls import path
from .views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    CategoryListView,
    SubmitExpenseView,
    ApproveExpenseView,
    RejectExpenseView,
    EmployeeDashboardView,
    ManagerDashboardView,
)

urlpatterns = [

    path("", ExpenseListCreateView.as_view(), name="expense-list-create"),
    path("<int:pk>/", ExpenseDetailView.as_view(), name="expense-detail"),
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("<int:pk>/submit/",SubmitExpenseView.as_view()),
    path("<int:pk>/approve/",ApproveExpenseView.as_view()),
    path("<int:pk>/reject/",RejectExpenseView.as_view()),
    path("dashboard/employee/",EmployeeDashboardView.as_view(),name="employee-dashboard"),
    path("dashboard/manager/",ManagerDashboardView.as_view(),name="manager-dashboard"),

]