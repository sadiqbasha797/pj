import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { ManagerService } from '../../services/manager.service';
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
  selector: 'app-chat-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-manager.component.html',
  styleUrls: ['./chat-manager.component.css']
})
export class ChatManagerComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage: string = '';
  selectedUser: User | null = null;
  users: User[] = [];
  currentUserId: string = '';
  isLoading: boolean = true;
  private subscriptions: Subscription[] = [];
  isTyping: any;
  isSending: boolean = false;
  activeTab: 'users' | 'messages' = 'messages';
  allUsers: User[] = [];
  messagedUsers: User[] = [];
  private messagesContainer: HTMLElement | null = null;

  constructor(
    private messageService: MessageService,
    private managerService: ManagerService,
    private cacheService: CacheService
  ) {
    this.currentUserId = localStorage.getItem('userId') || '';
    const token = localStorage.getItem('managerToken');
    
    if (!token) {
      console.error('No manager token found');
    }
    
    console.log('Constructor - Current User ID:', this.currentUserId);
  }

  ngOnInit() {
    if (!this.currentUserId || !localStorage.getItem('managerToken')) {
      console.error('Missing userId or managerToken');
      return;
    }
    
    console.log('ngOnInit - Using User ID:', this.currentUserId);
    this.messageService.joinRoom(this.currentUserId);
    this.loadUsers();
    this.loadMessagedUsers();
    
    this.subscriptions.push(
      this.messageService.getNewMessageUpdates().subscribe(message => {
        if (message && 
            ((message.sender.id === this.selectedUser?._id) || 
             (message.receiver.id === this.selectedUser?._id))) {
          const isDuplicate = this.messages.some(m => m._id === message._id);
          if (!isDuplicate) {
            this.messages = [...this.messages, message];
            if (message.receiver.id === this.currentUserId) {
              this.markAsRead(message._id!);
            }
            this.scrollToBottom();
          }
        }
      })
    );

    this.subscriptions.push(
      this.messageService.getUnreadCountUpdates().subscribe(count => {
        console.log('Unread messages count:', count);
      })
    );
  }

  loadUsers() {
    this.isLoading = true;
    
    forkJoin({
      managers: this.managerService.getAllManagers(),
      developers: this.managerService.getAllDevelopers(),
      admins: this.managerService.getAllAdmins(),
      digitalMarketing: this.managerService.getAllDigitalMarketingMembers(),
      contentCreators: this.managerService.getAllContentCreatorMembers()
    }).subscribe({
      next: (response) => {
        this.allUsers = [
          ...(Array.isArray(response.managers) ? response.managers : []).map((user: any) => ({
            _id: user._id,
            username: user.username,
            role: 'manager',
            email: user.email
          })),
          ...(Array.isArray(response.developers) ? response.developers : []).map((user: any) => ({
            _id: user._id,
            username: user.username,
            role: 'developer',
            email: user.email
          })),
          ...(Array.isArray(response.admins?.admins) ? response.admins.admins : []).map((user: any) => ({
            _id: user._id,
            username: user.username,
            role: 'admin',
            email: user.email
          })),
          ...(Array.isArray(response.digitalMarketing?.data) ? response.digitalMarketing.data : []).map((user: any) => ({
            _id: user._id,
            username: user.username,
            role: 'digitalMarketing',
            email: user.email
          })),
          ...(Array.isArray(response.contentCreators?.data) ? response.contentCreators.data : []).map((user: any) => ({
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
        this.allUsers = [];
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
              },
              error: (error) => {
                console.error('Error loading conversation:', error);
              }
            });
          });
        } else {
          console.error('Invalid response format from getMessagedUsers:', response);
          this.messagedUsers = [];
        }
      },
      error: (error) => {
        console.error('Error loading messaged users:', error);
        this.messagedUsers = [];
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
        console.log('Loading messages from cache');
        this.messages = cachedMessages;
        cachedMessages.forEach(message => {
          if (!message.read && message.receiver.id === this.currentUserId) {
            this.markAsRead(message._id!);
          }
        });
        this.scrollToBottom();
      } else {
        console.log('Loading messages from API');
        this.messageService.getConversation(this.selectedUser._id)
          .subscribe({
            next: (messages) => {
              this.messages = messages;
              this.cacheService.setCachedMessages(
                this.currentUserId,
                this.selectedUser!._id,
                messages
              );
              messages.forEach(message => {
                if (!message.read && message.receiver.id === this.currentUserId) {
                  this.markAsRead(message._id!);
                }
              });
              this.scrollToBottom();
            },
            error: (error) => {
              console.error('Error loading conversation:', error);
            }
          });
      }
    }
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedUser && !this.isSending) {
      this.isSending = true;
      const messageContent = this.newMessage.trim();
      this.newMessage = '';
      
      this.messageService.sendMessage(
        this.selectedUser._id,
        this.selectedUser.role,
        messageContent
      ).subscribe({
        next: (message) => {
          const isDuplicate = this.messages.some(m => m._id === message._id);
          if (!isDuplicate) {
            this.messages = [...this.messages, message];
            
            const currentCache = this.cacheService.getCachedMessages(
              this.currentUserId,
              this.selectedUser!._id
            ) || [];
            
            this.cacheService.setCachedMessages(
              this.currentUserId,
              this.selectedUser!._id,
              [...currentCache, message]
            );
            
            this.loadMessagedUsers();
            this.scrollToBottom();
          }
          
          this.isSending = false;
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.isSending = false;
          this.newMessage = messageContent;
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

  ngOnDestroy() {
    this.cacheService.clearMessageCache(this.currentUserId);
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.messageService.disconnect();
  }

  getUserList(): User[] {
    return this.activeTab === 'users' ? this.allUsers : this.messagedUsers;
  }
}
