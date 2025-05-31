import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { MarketerService } from '../../services/marketer.services';
import { Subscription, forkJoin } from 'rxjs';
import { CacheService } from '../../services/cache.service';
import { finalize } from 'rxjs/operators';

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
  selector: 'app-chat-marketer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-marketer.component.html',
  styleUrl: './chat-marketer.component.css'
})
export class ChatMarketerComponent implements OnInit, OnDestroy {
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
    private marketerService: MarketerService,
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

  loadAllUsers() {
    this.isLoading = true;
    forkJoin({
      managers: this.marketerService.getAllManagers(),
      developers: this.marketerService.getAllDevelopers(),
      contentCreators: this.marketerService.getAllContentCreators(),
      marketingMembers: this.marketerService.getAllMarketingMembers(),
      admins: this.marketerService.getAllAdmins(),
      clients: this.marketerService.getAllClients()
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
          ...(Array.isArray(response.contentCreators?.data) ? response.contentCreators.data : []).map((user: any) => ({
            _id: user._id,
            username: user.username,
            role: 'contentCreator',
            email: user.email
          })),
          ...(Array.isArray(response.marketingMembers?.data) ? response.marketingMembers.data : []).map((user: any) => ({
            _id: user._id,
            username: user.username,
            role: 'digitalMarketing',
            email: user.email
          })),
          ...(Array.isArray(response.admins?.admins) ? response.admins.admins : []).map((user: any) => ({
            _id: user._id,
            username: user.username,
            role: 'admin',
            email: user.email
          })),
          ...(Array.isArray(response.clients?.clients) ? response.clients.clients : []).map((user: any) => ({
            _id: user._id,
            username: user.clientName,
            role: 'client',
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
    this.isLoading = true;
    this.messageService.getMessagedUsers().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading messaged users:', error);
        // Handle error (e.g., show error message to user)
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
    if (this.newMessage.trim() && this.selectedUser && !this.isSending) {
      this.isSending = true;
      const messageContent = this.newMessage.trim();
      this.newMessage = ''; // Clear message input immediately
      
      this.messageService.sendMessage(
        this.selectedUser._id,
        this.selectedUser.role,
        messageContent
      ).subscribe({
        next: (message) => {
          const isDuplicate = this.messages.some(m => m._id === message._id);
          if (!isDuplicate) {
            this.messages = [...this.messages, message];
            
            // Update cache
            const currentCache = this.cacheService.getCachedMessages(
              this.currentUserId,
              this.selectedUser!._id
            ) || [];
            
            this.cacheService.setCachedMessages(
              this.currentUserId,
              this.selectedUser!._id,
              [...currentCache, message]
            );
            
            // Refresh messaged users list
            this.loadMessagedUsers();
            this.scrollToBottom();
          }
          
          this.isSending = false;
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.isSending = false;
          this.newMessage = messageContent; // Restore message on error
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

  private setupMessageListener() {
    const subscription = this.messageService.getNewMessageUpdates()
      .subscribe(message => {
        if (message) {
          // Handle new message
          if (this.selectedUser && 
              (message.sender.id === this.selectedUser._id || 
               message.receiver.id === this.selectedUser._id)) {
            // Add message to current conversation if not duplicate
            const isDuplicate = this.messages.some(m => m._id === message._id);
            if (!isDuplicate) {
              this.messages = [...this.messages, message];
              
              // Mark as read if we're the receiver
              if (message.receiver.id === this.currentUserId) {
                this.markAsRead(message._id!);
              }
              
              // Update cache
              const currentCache = this.cacheService.getCachedMessages(
                this.currentUserId,
                this.selectedUser._id
              ) || [];
              
              this.cacheService.setCachedMessages(
                this.currentUserId,
                this.selectedUser._id,
                [...currentCache, message]
              );
              
              this.scrollToBottom();
            }
          }
          
          // Update messaged users list
          this.loadMessagedUsers();
        }
      });

    // Add subscription to be cleaned up on destroy
    this.subscriptions.push(subscription);
  }
}
