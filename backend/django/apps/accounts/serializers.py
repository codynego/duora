from datetime import date

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from apps.matching.models import DiscoveryProfile
from .identity import get_or_create_anonymous_identity

User = get_user_model()


class MeSerializer(serializers.ModelSerializer):
    """The small, private account record used by Dorah's signed-in surfaces."""

    display_name = serializers.SerializerMethodField()
    anonymous_username = serializers.SerializerMethodField()
    anonymous_display_name = serializers.SerializerMethodField()
    anonymous_avatar_variant = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'display_name', 'anonymous_username', 'anonymous_display_name', 'anonymous_avatar_variant', 'email', 'date_joined')
        read_only_fields = ('id', 'date_joined')

    def get_display_name(self, user):
        return get_or_create_anonymous_identity(user).display_name

    def get_anonymous_username(self, user):
        return get_or_create_anonymous_identity(user).username

    def get_anonymous_display_name(self, user):
        return get_or_create_anonymous_identity(user).display_name

    def get_anonymous_avatar_variant(self, user):
        return get_or_create_anonymous_identity(user).avatar_variant


class MeUpdateSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(max_length=64, required=False, allow_blank=False, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'display_name')

    def validate_username(self, value):
        username = value.strip()
        if not username:
            raise serializers.ValidationError('Choose a username.')
        other_users = User.objects.filter(username__iexact=username).exclude(pk=self.instance.pk)
        if other_users.exists():
            raise serializers.ValidationError('This username is already in use.')
        return username

    def update(self, instance, validated_data):
        display_name = validated_data.pop('display_name', None)
        for field, value in validated_data.items():
            setattr(instance, field, value.strip() if isinstance(value, str) else value)
        if display_name is not None:
            identity = get_or_create_anonymous_identity(instance)
            identity.display_name = display_name.strip()
            identity.save(update_fields=('display_name', 'updated_at'))
        instance.save()
        return instance


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=10)
    password_confirm = serializers.CharField(write_only=True)
    date_of_birth = serializers.DateField(input_formats=['%Y-%m-%d', '%m/%d/%Y'])

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('This email cannot be used for a new account.')
        return value

    def validate_date_of_birth(self, value):
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError('You must be at least 18 to join Dorah.')
        if value > today:
            raise serializers.ValidationError('Date of birth cannot be in the future.')
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        validate_password(attrs['password'], user=User(username=attrs['email'], email=attrs['email']))
        return attrs

    def create(self, validated_data):
        email = validated_data['email']
        date_of_birth = validated_data['date_of_birth']
        user = User.objects.create_user(username=email, email=email, password=validated_data['password'])
        DiscoveryProfile.objects.create(user=user, date_of_birth=date_of_birth)
        get_or_create_anonymous_identity(user)
        return user
