from django.core.management.base import BaseCommand
from expenses.models import Category


class Command(BaseCommand):
    help = "Create default expense categories"

    def handle(self, *args, **kwargs):
        categories = [
            "Food",
            "Transport",
            "Accommodation",
            "Shopping",
            "Medical",
            "Office",
            "Travel",
            "Other",
        ]

        for name in categories:
            Category.objects.get_or_create(name=name)

        self.stdout.write(
            self.style.SUCCESS("Default categories created successfully.")
        )