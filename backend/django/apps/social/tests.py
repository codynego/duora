from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.matching.models import DiscoveryProfile
from .models import DiscussionReply, Question, Thought


class DiscussionReplyPersistenceTests(APITestCase):
    def test_reply_is_returned_after_a_fresh_detail_request(self):
        user = get_user_model().objects.create_user(
            username='reply-test@example.com',
            email='reply-test@example.com',
            password='TestPass123!',
        )
        question = Question.objects.create(
            text='A persistence test question',
            category='Friendship',
            status=Question.Status.PUBLISHED,
            published_at=timezone.now(),
        )
        thought = Thought.objects.create(
            author=user,
            question=question,
            body='A test thought',
            moderation_status=Thought.ModerationStatus.APPROVED,
            published_at=timezone.now(),
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(
            f'/api/v1/social/thoughts/{thought.id}/replies/',
            {'body': 'A reply that should persist.'},
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(DiscussionReply.objects.filter(thought=thought).count(), 1)

        fresh_response = self.client.get(f'/api/v1/social/thoughts/{thought.id}/')
        self.assertEqual(fresh_response.status_code, 200)
        self.assertEqual(len(fresh_response.data['replies']), 1)
        self.assertEqual(fresh_response.data['replies'][0]['body'], 'A reply that should persist.')


class OnboardingAnswerCooldownTests(APITestCase):
    def test_onboarding_answer_blocks_another_answer_for_three_hours(self):
        user = get_user_model().objects.create_user(
            username='cooldown-test@example.com',
            email='cooldown-test@example.com',
            password='TestPass123!',
        )
        first = Question.objects.create(
            text='A first onboarding question',
            category='Friendship',
            status=Question.Status.PUBLISHED,
            published_at=timezone.now(),
        )
        second = Question.objects.create(
            text='A second question',
            category='Friendship',
            status=Question.Status.PUBLISHED,
            published_at=timezone.now(),
        )
        DiscoveryProfile.objects.create(user=user, onboarding_question_id=first.id)
        self.client.force_authenticate(user=user)

        first_response = self.client.post(
            '/api/v1/social/thoughts/',
            {'question_id': first.id, 'body': 'My first thought', 'onboarding': True},
            format='json',
        )
        self.assertEqual(first_response.status_code, 201)

        second_response = self.client.post(
            '/api/v1/social/thoughts/',
            {'question_id': second.id, 'body': 'Too soon'},
            format='json',
        )
        self.assertEqual(second_response.status_code, 409)
        self.assertEqual(second_response.data['code'], 'answer_cooldown')
