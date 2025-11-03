import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { AdminService } from '../../services/admin.service';
import { Subscription, forkJoin } from 'rxjs';
import { CacheService } from '../../services/cache.service';

interface User {
  _id: string;
  username: string;
  role: string;
  email: string;
  recentMessage?: {
    content: string;
    createdAt: Date;
    unread?: boolean;
  };
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage: string = '';
  selectedUser: User | null = null;
  users: User[] = [];
  currentUserId: string = '';
  isLoading: boolean = true;
  private subscriptions: Subscription[] = [];
  isTyping: boolean = false;
  isSending: boolean = false;
  activeTab: 'users' | 'messages' = 'messages';
  allUsers: User[] = [];
  messagedUsers: User[] = [];
  private messagesContainer: HTMLElement | null = null;
  private messageUpdateSubscription: Subscription | null = null;

  constructor(
    private messageService: MessageService,
    private adminService: AdminService,
    private cacheService: CacheService
  ) {
    this.currentUserId = localStorage.getItem('userId') || '';
  }

  ngOnInit() {
    if (!this.currentUserId) {
      console.error('No user ID found in localStorage');
      return;
    }
    
    this.loadAllUsers();
    this.loadMessagedUsers();
    this.setupMessageListener();
  }

  private setupMessageListener() {
    this.messageUpdateSubscription = this.messageService.getNewMessageUpdates()
      .subscribe(message => {
        if (message) {
          // Handle new message
          if (this.selectedUser && 
              (message.sender.id === this.selectedUser._id || 
               message.receiver.id === this.selectedUser._id)) {
            // Add message to current conversation
            const isDuplicate = this.messages.some(m => m._id === message._id);
            if (!isDuplicate) {
              this.messages.push(message);
              this.scrollToBottom();
              
              // Mark message as read if we're the receiver
              if (message.receiver.id === this.currentUserId) {
                this.markAsRead(message._id!);
              }
            }
          }
          
          // Update messaged users list to show latest message
          this.updateMessagedUsersList(message);
        }
      });
  }

  private updateMessagedUsersList(newMessage: any) {
    const userId = newMessage.sender.id === this.currentUserId ? 
                  newMessage.receiver.id : 
                  newMessage.sender.id;

    const existingUserIndex = this.messagedUsers.findIndex(u => u._id === userId);
    
    if (existingUserIndex > -1) {
      // Update existing user's recent message
      this.messagedUsers[existingUserIndex].recentMessage = {
        content: newMessage.content,
        createdAt: newMessage.createdAt,
        unread: !newMessage.read && newMessage.receiver.id === this.currentUserId
      };
      
      // Move this user to the top of the list
      const [user] = this.messagedUsers.splice(existingUserIndex, 1);
      this.messagedUsers.unshift(user);
    } else {
      // If it's a new conversation, reload the messaged users list
      this.loadMessagedUsers();
    }
  }

  loadAllUsers() {
    this.isLoading = true;
    forkJoin({
      managers: this.adminService.getAllManagers(),
      developers: this.adminService.getAllDevelopers(),
      clients: this.adminService.getAllClients(),
      digitalMarketing: this.adminService.getAllDigitalMarketingMembers(),
      contentCreators: this.adminService.getAllContentCreatorMembers()
    }).subscribe({
      next: (response) => {
        this.allUsers = [
          ...response.managers.map((user: { _id: any; username: any; email: any; }) => ({
            _id: user._id,
            username: user.username,
            role: 'manager',
            email: user.email
          })),
          ...response.developers.map((user: { _id: any; username: any; email: any; }) => ({
            _id: user._id,
            username: user.username,
            role: 'developer',
            email: user.email
          })),
          ...response.clients.clients.map((user: { _id: any; clientName: any; email: any; }) => ({
            _id: user._id,
            username: user.clientName,
            role: 'client',
            email: user.email
          })),
          ...response.digitalMarketing.data.map((user: { _id: any; username: any; email: any; }) => ({
            _id: user._id,
            username: user.username,
            role: 'digitalMarketing',
            email: user.email
          })),
          ...response.contentCreators.data.map((user: { _id: any; username: any; email: any; }) => ({
            _id: user._id,
            username: user.username,
            role: 'contentCreator',
            email: user.email
          }))
        ].filter(user => user._id !== this.currentUserId);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  loadMessagedUsers() {
    this.messageService.getMessagedUsers().subscribe({
      next: (response: any) => {
        if (response.data && Array.isArray(response.data)) {
          this.messagedUsers = [];
          response.data.forEach((user: any) => {
            this.messageService.getConversation(user._id).subscribe({
              next: (messages) => {
                const recentMessage = messages[messages.length - 1];
                this.messagedUsers.push({
                  _id: user._id,
                  username: user.username,
                  role: user.role,
                  email: user.email,
                  recentMessage: recentMessage ? {
                    content: recentMessage.content,
                    createdAt: recentMessage.createdAt,
                    unread: !recentMessage.read && recentMessage.receiver.id === this.currentUserId
                  } : undefined
                });
              }
            });
          });
        }
      },
      error: (error) => {
        console.error('Error loading messaged users:', error);
        this.messagedUsers = [];
      }
    });
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.loadConversation();
  }

  loadConversation() {
    if (this.selectedUser) {
      const cachedMessages = this.cacheService.getCachedMessages(
        this.currentUserId,
        this.selectedUser._id
      );

      if (cachedMessages) {
        this.messages = cachedMessages;
        this.markUnreadMessagesAsRead();
        this.scrollToBottom();
      } else {
        this.messageService.getConversation(this.selectedUser._id)
          .subscribe({
            next: (messages) => {
              this.messages = messages;
              this.cacheService.setCachedMessages(
                this.currentUserId,
                this.selectedUser!._id,
                messages
              );
              this.markUnreadMessagesAsRead();
              this.scrollToBottom();
            },
            error: (error) => {
              console.error('Error loading conversation:', error);
            }
          });
      }
    }
  }

  private markUnreadMessagesAsRead() {
    this.messages.forEach(message => {
      if (!message.read && message.receiver.id === this.currentUserId) {
        this.markAsRead(message._id!);
      }
    });
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedUser && !this.isSending) {
      this.isSending = true;
      this.messageService.sendMessage(
        this.selectedUser._id,
        this.selectedUser.role,
        this.newMessage.trim()
      ).subscribe({
        next: (sentMessage) => {
          // Add the sent message to the current conversation immediately
          this.messages.push(sentMessage);
          const currentCache = this.cacheService.getCachedMessages(
            this.currentUserId,
            this.selectedUser!._id
          ) || [];
          
          this.cacheService.setCachedMessages(
            this.currentUserId,
            this.selectedUser!._id,
            [...currentCache, sentMessage]
          );
          
          this.newMessage = '';
          this.isSending = false;
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.isSending = false;
        }
      });
    }
  }

  markAsRead(messageId: string) {
    this.messageService.markAsRead(messageId).subscribe({
      error: (error) => {
        console.error('Error marking message as read:', error);
      }
    });
  }

  switchTab(tab: 'users' | 'messages') {
    this.activeTab = tab;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesContainer = document.querySelector('.messages-container');
      if (this.messagesContainer) {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }
    }, 100);
  }

  ngOnDestroy() {
    this.cacheService.clearMessageCache(this.currentUserId);
    if (this.messageUpdateSubscription) {
      this.messageUpdateSubscription.unsubscribe();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.messageService.disconnect();
  }
}
