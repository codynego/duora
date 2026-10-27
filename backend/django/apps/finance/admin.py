from django.contrib import admin

from .models import Business, Contact, FinancialAccount, Obligation, Transaction


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'owner',
        'business_type',
        'industry',
        'country',
        'currency',
        'plan',
        'created_at',
    )
    list_filter = ('plan', 'country', 'currency', 'business_type', 'industry')
    search_fields = ('name', 'owner__email', 'owner__username')
    readonly_fields = ('id', 'created_at', 'updated_at')

    def get_readonly_fields(self, request, obj=None):
        fields = list(super().get_readonly_fields(request, obj))
        if obj and (obj.transactions.exists() or obj.accounts.exists() or obj.obligations.exists()):
            fields.extend(('currency', 'opening_balance'))
        return fields

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'description',
        'business',
        'kind',
        'amount',
        'category',
        'counterparty',
        'occurred_on',
        'created_by',
    )
    list_filter = ('kind', 'category', 'occurred_on')
    search_fields = ('description', 'category', 'counterparty', 'business__name')
    readonly_fields = ('id', 'business', 'created_by', 'kind', 'description', 'amount', 'category', 'counterparty', 'account', 'transfer_account', 'contact', 'obligation', 'occurred_on', 'created_at')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(FinancialAccount)
class FinancialAccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'kind', 'currency', 'opening_balance', 'is_active')
    list_filter = ('kind', 'currency', 'is_active')
    search_fields = ('name', 'business__name')
    readonly_fields = ('id', 'business', 'name', 'kind', 'currency', 'opening_balance', 'is_active', 'created_at', 'updated_at')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'kind', 'email', 'phone', 'created_at')
    list_filter = ('kind',)
    search_fields = ('name', 'email', 'phone', 'business__name')
    readonly_fields = ('id', 'business', 'kind', 'name', 'email', 'phone', 'notes', 'created_at', 'updated_at')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Obligation)
class ObligationAdmin(admin.ModelAdmin):
    list_display = ('description', 'business', 'contact', 'kind', 'amount', 'balance', 'due_date', 'status')
    list_filter = ('kind', 'status', 'due_date')
    search_fields = ('description', 'reference', 'contact__name', 'business__name')
    readonly_fields = ('id', 'business', 'contact', 'kind', 'description', 'reference', 'amount', 'balance', 'due_date', 'status', 'affects_performance', 'created_at', 'updated_at')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
