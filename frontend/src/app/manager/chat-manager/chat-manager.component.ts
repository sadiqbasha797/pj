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
    
    this.subscriptions.push(
      this.messageService.getNewMessageUpdates().subscribe(message => {
        if (message && 
            ((message.sender.id === this.selectedUser?._id) || 
             (message.receiver.id === this.selectedUser?._id))) {
          if (message.sender.id !== this.currentUserId) {
            const isDuplicate = this.messages.some(m => m._id === message._id);
            if (!isDuplicate) {
              this.messages = [...this.messages, message];
              if (message.receiver.id === this.currentUserId) {
                this.markAsRead(message._id!);
              }
            }
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
    console.log('loadUsers - Current User ID:', this.currentUserId);
    this.isLoading = true;
    
    forkJoin({
      managers: this.managerService.getAllManagers(),
      developers: this.managerService.getAllDevelopers(),
      admins: this.managerService.getAllAdmins()
    }).subscribe({
      next: (response) => {
        this.users = [
          ...response.managers,
          ...response.developers,
          ...response.admins.admins
        ]
        .filter(user => user._id !== this.currentUserId)
        .map(user => ({
          _id: user._id,
          username: user.username,
          role: user.role,
          email: user.email
        }));
        
        console.log('Loaded users:', this.users);
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
}
