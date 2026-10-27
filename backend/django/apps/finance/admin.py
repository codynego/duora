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
    readonly_fields = ('id', 'created_at')


@admin.register(FinancialAccount)
class FinancialAccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'kind', 'currency', 'opening_balance', 'is_active')
    list_filter = ('kind', 'currency', 'is_active')
    search_fields = ('name', 'business__name')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'kind', 'email', 'phone', 'created_at')
    list_filter = ('kind',)
    search_fields = ('name', 'email', 'phone', 'business__name')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Obligation)
class ObligationAdmin(admin.ModelAdmin):
    list_display = ('description', 'business', 'contact', 'kind', 'amount', 'balance', 'due_date', 'status')
    list_filter = ('kind', 'status', 'due_date')
    search_fields = ('description', 'reference', 'contact__name', 'business__name')
    readonly_fields = ('id', 'created_at', 'updated_at')
