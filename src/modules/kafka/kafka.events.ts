export enum DomainEvents {
    //users
    UserCreated = 'user.created',
    User_update_profile = 'user.update_profile',
    User_close_the_lock = 'user.close_the_lock',
    User_update_password = 'user.update_password',
    User_update_item = 'user.update_item',

    //labels
    Label_created = 'label.create',
    Label_delete = 'label.delete',
    Label_update = 'label.update',

    //block ip
    BlockIp_create = 'blockIp.create',
    BlockIp_update = 'blockIp.update',
    BlockIp_delete = 'blockIp.delete',

    //live chat color
    LiveChatColor_create = 'liveChatColor.create',
    LiveChatColor_update = 'liveChatColor.update',
    LiveChatColor_delete = 'liveChatColor.delete',

    //friend
    Friend_create = 'friend.create',
}