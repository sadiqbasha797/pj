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
    this.loadUsers();
    
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

  loadUsers() {
    console.log('loadUsers - Current User ID:', this.currentUserId);
    this.isLoading = true;
    // Use forkJoin to make parallel requests
    forkJoin({
      managers: this.adminService.getAllManagers(),
      developers: this.adminService.getAllDevelopers()
    }).subscribe({
      next: (response) => {
        // Combine and filter out current user
        this.users = [
          ...response.managers,
          ...response.developers
        ].filter(user => user._id !== this.currentUserId)
         .map(user => ({
           _id: user._id,
           username: user.username,
           role: user.role,
           email: user.email
         }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
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
          this.newMessage = '';
          this.isSending = false;
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

  ngOnDestroy() {
    // Clear message cache when component is destroyed
    this.cacheService.clearMessageCache(this.currentUserId);
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.messageService.disconnect();
  }
}
