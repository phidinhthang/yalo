import { Server } from 'socket.io';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common/decorators';
import { User } from 'src/user/user.entity';
import { Member } from 'src/member/member.entity';
import { MemberRepository } from 'src/member/member.repository';
import { Conversation } from 'src/conversation/conversation.entity';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class SocketService {
  public socket: Server = null;

  constructor(
    private readonly em: EntityManager,
    private readonly userRepository: UserRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  async toggleOnlineStatus(userId: number) {
    await this.setOnlineStatus(userId, true);
    const users = await this.em.fork().find(User, {});
    users
      .filter((u) => u.id !== userId)
      .forEach((u) => {
        this.socket.to(`${u.id}`).emit('toggle_online', userId);
      });
  }

  async toggleOfflineStatus(userId: number) {
    await this.setOnlineStatus(userId, false);
    const users = await this.em.fork().find(User, {});
    users
      .filter((u) => u.id !== userId)
      .forEach((u) => {
        this.socket.to(`${u.id}`).emit('toggle_offline', userId);
      });
  }

  async setOnlineStatus(userId: number, isOnline: boolean): Promise<void> {
    await this.em
      .fork()
      .nativeUpdate(User, userId, { isOnline, lastLoginAt: new Date() });
  }

  async newMessage(senderId: number, conversationId: number, message: any) {
    const members = await this.memberRepository.find({
      conversation: conversationId,
    });
    const users = members.map((m) => m.user).filter((u) => u.id !== senderId);
    console.log('member ids ', users);
    users.forEach((u) => {
      this.socket.to(`${u.id}`).emit('new_message', message);
    });
  }

  async typingMessage(meId: number, conversationId: number) {
    const typingUser = await this.em.fork().findOneOrFail(User, meId);
    const members = await this.em.fork().find(Member, {
      conversation: conversationId,
    });
    const isUserMember = members?.find((m) => m.user.id === meId);
    if (!isUserMember) {
      return false;
    }
    const users = members?.map((m) => m.user).filter((u) => u.id !== meId);
    users?.forEach((u) => {
      this.socket.to(`${u.id}`).emit('user_typing', {
        conversationId: conversationId,
        user: typingUser,
      });
    });
  }

  async newUser(user: User) {
    this.socket.emit('new_user', user);
  }

  async newConversation(adminId: number, conversation: Conversation) {
    const users = conversation.members.getItems().map((m) => m.user);
    users
      .filter((u) => u.id !== adminId)
      .forEach((u) => {
        this.socket.to(`${u.id}`).emit('new_conversation', conversation);
      });
  }

  async deleteConversation(adminId: number, conversation: Conversation) {
    const users = conversation.members.getItems().map((m) => m.user);
    users
      .filter((u) => u.id !== adminId)
      .forEach((u) => {
        this.socket.to(`${u.id}`).emit('delete_conversation', conversation);
      });
  }

  async leaveConversation(
    userId: number,
    conversation: Conversation,
    conversationDeletedReason?: string,
  ) {
    const members = conversation.members.getItems();
    console.log('conversation members ', members);
    const users = members.map((m) => m.user);
    users
      .filter((u) => u.id !== userId)
      .forEach((u) => {
        this.socket.to(`${u.id}`).emit('leave_conversation', {
          userId,
          conversation,
          conversationDeletedReason,
        });
      });
  }

  async deleteMessage(
    messageId: number,
    senderId: number,
    conversationId: number,
  ) {
    const members = await this.memberRepository.find({
      conversation: conversationId,
    });
    const users = members.map((m) => m.user).filter((u) => u.id !== senderId);
    users.forEach((u) => {
      this.socket
        .to(`${u.id}`)
        .emit('delete_message', messageId, conversationId);
    });
  }

  async markReadMsg(meId: number, conversationId: number, lastReadAt: Date) {
    const members = await this.memberRepository.find({
      conversation: conversationId,
    });

    const users = members.map((m) => m.user).filter((u) => u.id !== meId);
    users.forEach((u) => {
      this.socket
        .to(`${u.id}`)
        .emit('update_mark_read', meId, conversationId, lastReadAt);
    });
  }

  async newFriendRequest(requesterId: number, recipientId: number) {
    const requester = await this.userRepository.findOne(requesterId);
    this.socket.to(`${recipientId}`).emit('new_friend_request', requester);
  }

  async friendAccepted(requesterId: number, recipientId: number) {
    const recipient = await this.userRepository.findOne(recipientId);
    this.socket.to(`${requesterId}`).emit('friend_accepted', recipient);
  }

  async requestCancelled(requesterId: number, recipientId: number) {
    const recipient = await this.userRepository.findOne(recipientId);
    this.socket.to(`${requesterId}`).emit('request_cancelled', recipient);
  }

  async friendRemoved(fromUserId: number, toUserId: number) {
    const fromUser = await this.userRepository.findOne(fromUserId);
    this.socket.to(`${toUserId}`).emit('friend_removed', fromUser);
  }
}
