from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class MeSerializer(serializers.ModelSerializer):
    """The small, private account record used by Dorah's signed-in surfaces."""

    display_name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('id', 'username', 'display_name', 'email', 'date_joined')
        read_only_fields = ('id', 'date_joined')

    def get_display_name(self, user):
        return user.first_name or user.username.split('@', 1)[0]


class MeUpdateSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(max_length=64, required=False, allow_blank=False, source='first_name')

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

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=10)
    password_confirm = serializers.CharField(write_only=True)

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('This email cannot be used for a new account.')
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
        return User.objects.create_user(username=email, email=email, password=validated_data['password'])
