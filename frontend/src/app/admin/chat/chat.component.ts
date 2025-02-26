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
  isTyping: any;
  isSending: boolean = false;
  activeTab: 'users' | 'messages' = 'messages';
  allUsers: User[] = [];
  messagedUsers: User[] = [];
  private messagesContainer: HTMLElement | null = null;

  constructor(
    private messageService: MessageService,
    private adminService: AdminService,
    private cacheService: CacheService
  ) {
    this.currentUserId = localStorage.getItem('userId') || '';
    console.log('Constructor - Current User ID:', this.currentUserId);
  }

  ngOnInit() {
    if (!this.currentUserId) {
      console.error('No user ID found in localStorage');
      return;
    }
    
    console.log('ngOnInit - Using User ID:', this.currentUserId);
    this.messageService.joinRoom(this.currentUserId);
    this.loadAllUsers();
    this.loadMessagedUsers();
    
    this.subscriptions.push(
      this.messageService.getNewMessageUpdates().subscribe(message => {
        if (message && 
            ((message.sender.id === this.selectedUser?._id) || 
             (message.receiver.id === this.selectedUser?._id))) {
          const isDuplicate = this.messages.some(m => m._id === message._id);
          if (!isDuplicate) {
            this.messages.push(message);
            if (message.receiver.id === this.currentUserId) {
              this.markAsRead(message._id!);
            }
          }
        }
      })
    );
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
        // Combine all users and format them consistently
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
        // Check if response has data property and it's an array
        if (response.data && Array.isArray(response.data)) {
          this.messagedUsers = [];  // Clear existing messages
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

  selectUser(user: User) {
    this.selectedUser = user;
    this.loadConversation();
  }

  loadConversation() {
    if (this.selectedUser) {
      // Try to get messages from cache first
      const cachedMessages = this.cacheService.getCachedMessages(
        this.currentUserId,
        this.selectedUser._id
      );

      if (cachedMessages) {
        console.log('Loading messages from cache');
        this.messages = cachedMessages;
        // Still mark unread messages as read
        cachedMessages.forEach(message => {
          if (!message.read && message.receiver.id === this.currentUserId) {
            this.markAsRead(message._id!);
          }
        });
        this.scrollToBottom();
      } else {
        // If no cache, load from API
        console.log('Loading messages from API');
        this.messageService.getConversation(this.selectedUser._id)
          .subscribe({
            next: (messages) => {
              this.messages = messages;
              // Cache the messages
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
    if (this.newMessage.trim() && this.selectedUser) {
      this.isSending = true;
      this.messageService.sendMessage(
        this.selectedUser._id,
        this.selectedUser.role,
        this.newMessage.trim()
      ).subscribe({
        next: (message) => {
          // Update cache with new message
          const currentCache = this.cacheService.getCachedMessages(
            this.currentUserId,
            this.selectedUser!._id
          ) || [];
          this.cacheService.setCachedMessages(
            this.currentUserId,
            this.selectedUser!._id,
            [...currentCache, message]
          );
          this.messages.push(message);
          this.newMessage = '';
          this.isSending = false;
          this.loadMessagedUsers();
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

  ngOnDestroy() {
    // Clear message cache when component is destroyed
    this.cacheService.clearMessageCache(this.currentUserId);
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.messageService.disconnect();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesContainer = document.querySelector('.messages-container');
      if (this.messagesContainer) {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }
    }, 100);
  }
}
