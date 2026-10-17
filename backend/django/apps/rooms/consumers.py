import json
import time
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .models import RoomActivity, RoomMembership


@database_sync_to_async
def is_current_member(*, room_id, user) -> bool:
    return RoomMembership.objects.filter(
        room_id=room_id,
        user=user,
        disposition=RoomMembership.Disposition.PRESENT,
    ).exists()


@database_sync_to_async
def record_activity(*, room_id, actor, event, payload) -> None:
    # An answer body is intentionally never written to this event log. The log
    # records the shared state transition, while private answer content remains
    # an experience-level concern with its own retention rules.
    if event == RoomActivity.Event.ANSWER_SAVED:
        payload = {'has_answer': bool(payload.get('answer'))}
    RoomActivity.objects.create(room_id=room_id, actor=actor, event=event, payload=payload)


class RoomConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        if not self.scope['user'].is_authenticated:
            await self.close(code=4401)
            return
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        if not await is_current_member(room_id=self.room_id, user=self.scope['user']):
            await self.close(code=4403)
            return
        self.group_name = f'room_{self.room_id}'
        self.recent_event_times = []
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept(subprotocol='bearer')
        await self.channel_layer.group_send(self.group_name, {'type': 'room.event', 'event': 'presence.joined', 'user_id': self.scope['user'].id})

    async def disconnect(self, _code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_send(self.group_name, {'type': 'room.event', 'event': 'presence.left', 'user_id': self.scope['user'].id})
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **_kwargs):
        event = content.get('event')
        payload = content.get('payload', {})
        allowed = set(RoomActivity.Event.values)
        if event not in allowed or not isinstance(payload, dict):
            await self.send_json({'event': 'error', 'message': 'Unsupported room event.'})
            return
        now = time.monotonic()
        self.recent_event_times = [sent_at for sent_at in self.recent_event_times if now - sent_at < 10]
        if len(self.recent_event_times) >= 20:
            await self.send_json({'event': 'error', 'message': 'You are sending room actions too quickly.'})
            return
        self.recent_event_times.append(now)
        if event == 'answer.saved':
            # A private answer must never travel to other room members before reveal.
            payload = {'has_answer': bool(payload.get('answer'))}
        if event == 'chat.sent':
            message = str(payload.get('message', '')).strip()
            if not message or len(message) > 500:
                await self.send_json({'event': 'error', 'message': 'Messages must be between 1 and 500 characters.'})
                return
            payload = {'message': message, 'actor_name': self.scope['user'].get_username()}
        if event == 'reaction.sent':
            reaction = str(payload.get('kind', '')).strip().lower()
            if reaction not in {'heart', 'laugh', 'support', 'cheer'}:
                await self.send_json({'event': 'error', 'message': 'That reaction is not available.'})
                return
            payload = {'kind': reaction, 'actor_name': self.scope['user'].get_username()}
        await record_activity(room_id=self.room_id, actor=self.scope['user'], event=event, payload=payload)
        await self.channel_layer.group_send(self.group_name, {'type': 'room.event', 'event': event, 'payload': payload, 'user_id': self.scope['user'].id})

    async def room_event(self, event):
        await self.send(text_data=json.dumps({'event': event['event'], 'payload': event.get('payload', {}), 'user_id': event.get('user_id')}))
