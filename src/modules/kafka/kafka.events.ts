export enum DomainEvents {
    //users
    UserCreated = 'user.created',
    UserUpdateIsOnlne = 'user.update_is_online',

    //friend
    Friend_create = 'friend.create',

    // fanpages
    FanPage_connect_facebook = 'fanPage.connect_facebook',
    FanPage_tokenRenewal = 'fanPage.tokenRenewal',
    FanPage_syncing = 'fanPage.syncing',
    FanPage_sync_socket = 'fanPage.sync_soket',

    //conversation
    conversation_create = 'conversation.create',
    conversation_socket_message = 'conversation.socket_message'
}