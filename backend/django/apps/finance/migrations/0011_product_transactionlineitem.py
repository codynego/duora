import uuid

from django.db import migrations, models
import django.db.models.deletion
import django.db.models.expressions


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0010_financialfinding'),
    ]

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=120)),
                ('sku', models.CharField(blank=True, max_length=60)),
                ('category', models.CharField(blank=True, max_length=60)),
                ('description', models.TextField(blank=True)),
                ('product_type', models.CharField(choices=[('product', 'Product'), ('service', 'Service')], default='product', max_length=10)),
                ('selling_price', models.DecimalField(decimal_places=2, max_digits=14)),
                ('cost_price', models.DecimalField(blank=True, decimal_places=2, max_digits=14, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('business', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='products', to='finance.business')),
            ],
            options={'ordering': ('name',)},
        ),
        migrations.CreateModel(
            name='TransactionLineItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('product_name', models.CharField(max_length=120)),
                ('sku', models.CharField(blank=True, max_length=60)),
                ('quantity', models.DecimalField(decimal_places=3, max_digits=12)),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=14)),
                ('unit_cost', models.DecimalField(blank=True, decimal_places=2, max_digits=14, null=True)),
                ('discount_amount', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('line_total', models.DecimalField(decimal_places=2, max_digits=14)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('product', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='transaction_lines', to='finance.product')),
                ('transaction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='line_items', to='finance.transaction')),
            ],
        ),
        migrations.AddConstraint(
            model_name='product',
            constraint=models.UniqueConstraint(condition=~models.Q(('sku', '')), fields=('business', 'sku'), name='finance_unique_product_sku'),
        ),
    ]
