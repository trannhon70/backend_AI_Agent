import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SocketService } from '../socket/socket.service';
import { DomainEvents } from '../kafka/kafka.events';

@Injectable()
export class FanpageSyncListener {
    constructor(
        private readonly socketService: SocketService,
    ) { }

    @OnEvent(DomainEvents.FanPage_sync_socket)
    handleSync(payload: any) {
        // console.log('EVENT RECEIVED:', payload);

        this.socketService.emitToRoom(String(payload.page_id), 'syncStatus', payload);
    }
}