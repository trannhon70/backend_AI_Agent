import { forwardRef, Global, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { FanpageSyncListener } from '../fanpages/fanpages.listener';

@Global()
@Module({
    imports: [
        // forwardRef(() => MessageModule),
    ], // 👈 để ChatGateway dùng MessageService 
    providers: [SocketService, SocketGateway, FanpageSyncListener],
    exports: [SocketService, SocketGateway], // 👈 export để middleware hoặc service khác dùng
})
export class SocketModule { }
