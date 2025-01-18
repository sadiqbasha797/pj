import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeveloperService } from '../../services/developer.service';
import { MessageService } from '../../services/message.service';
import { CacheService } from '../../services/cache.service';
import { Subscription, forkJoin } from 'rxjs';
import { ThemeService } from '../../services/theme.service';

interface User {
  _id: string;
  username: string;
  role: string;
  email: string;
}

@Component({
  selector: 'app-chat-developer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-developer.component.html',
  styleUrl: './chat-developer.component.css'
})
export class ChatDeveloperComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage: string = '';
  selectedUser: User | null = null;
  developers: any[] = [];
  managers: any[] = [];
  currentUserId: string = '';
  isLoading: boolean = true;
  private subscriptions: Subscription[] = [];
  isSending: boolean = false;
  admins: any[] = [];
  isDarkMode = false;

  constructor(
    private developerService: DeveloperService,
    private messageService: MessageService,
    private cacheService: CacheService,
    private themeService: ThemeService
  ) {
    this.currentUserId = localStorage.getItem('userId') || '';
    this.themeService.darkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );
  }

  ngOnInit() {
    if (!this.currentUserId) {
      this.developerService.getProfile().subscribe(profile => {
        this.currentUserId = profile._id;
        localStorage.setItem('userId', profile._id);
        this.initializeChat();
      });
    } else {
      this.initializeChat();
    }
  }

  private initializeChat() {
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
    this.isLoading = true;
    forkJoin({
      developers: this.developerService.fetchDevelopers(),
      managers: this.developerService.fetchManagers(),
      admins: this.developerService.getAllAdmins()
    }).subscribe({
      next: (response) => {
        this.developers = response.developers.filter((dev: { _id: string; }) => dev._id !== this.currentUserId);
        this.managers = response.managers;
        this.admins = response.admins?.admins || [];
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
        this.messages = cachedMessages;
        cachedMessages.forEach(message => {
          if (!message.read && message.receiver.id === this.currentUserId) {
            this.markAsRead(message._id);
          }
        });
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
    if (!this.newMessage.trim() || !this.selectedUser) return;

    this.isSending = true;
    this.messageService.sendMessage(
      this.selectedUser._id,
      this.selectedUser.role,
      this.newMessage.trim()
    ).subscribe({
      next: (message) => {
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

  markAsRead(messageId: string) {
    this.messageService.markAsRead(messageId).subscribe({
      error: (error) => {
        console.error('Error marking message as read:', error);
      }
    });
  }

  isMessageFromCurrentUser(message: any): boolean {
    return message.sender.id === this.currentUserId;
  }

  ngOnDestroy() {
    this.cacheService.clearMessageCache(this.currentUserId);
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.messageService.disconnect();
  }
}
