from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from expenses.models import Category
import os


class Command(BaseCommand):
    help = "Create default categories and admin user"

    def handle(self, *args, **kwargs):

        # Create default categories
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
            self.style.SUCCESS(
                "Default categories created successfully."
            )
        )

        # Create admin user
        User = get_user_model()

        username = os.getenv("ADMIN_USERNAME")
        email = os.getenv("ADMIN_EMAIL")
        password = os.getenv("ADMIN_PASSWORD")

        if username and email and password:

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                },
            )

            user.email = email
            user.is_staff = True
            user.is_superuser = True
            user.set_password(password)
            user.save()

            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Admin user '{username}' created successfully."
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Admin user '{username}' updated successfully."
                    )
                )

        else:
            self.stdout.write(
                self.style.WARNING(
                    "Admin environment variables are not configured."
                )
            )