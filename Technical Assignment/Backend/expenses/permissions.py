from rest_framework.permissions import BasePermission


class IsManagerOrAdmin(BasePermission):
    """
    Allows access only to managers and admins.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ["MANAGER", "ADMIN"]
        )