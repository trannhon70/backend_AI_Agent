import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SocketService } from '../socket/socket.service';
import { DomainEvents } from '../kafka/kafka.events';

@Injectable()
export class ConversationListener {
    constructor(
        private readonly socketService: SocketService,
    ) { }

    @OnEvent(DomainEvents.conversation_socket_message)
    handleSync(payload: any) {
        this.socketService.emitToRoom(String(payload.page_id), 'send_message', payload);
    }
}