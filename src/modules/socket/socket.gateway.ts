import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit, // 👈 thiếu cái này
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({
    cors: { origin: '*' },
})
export class SocketGateway implements OnGatewayInit {
    @WebSocketServer()
    server!: Server;

    constructor(private readonly socketService: SocketService) {
        console.log('✅ SocketGateway initialized');
    }

    afterInit(server: Server) { // 👈 nhận server từ Nest
        console.log('[Gateway] afterInit called');
        this.socketService.setServer(server);
    }
}