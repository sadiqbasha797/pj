import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id?: string;
  sender: {
    id: string;
    role: string;
  };
  receiver: {
    id: string;
    role: string;
  };
  content: string;
  read: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private socket: Socket;
  private apiUrl = 'https://pj-backend-y82g.onrender.com/api/message';
  private unreadCount = new BehaviorSubject<number>(0);
  private newMessage = new BehaviorSubject<Message | null>(null);

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3000');
    this.setupSocketListeners();
    this.getUnreadCount().subscribe();
  }

  private setupSocketListeners(): void {
    this.socket.on('newMessage', (data: { message: Message, receiverId: string }) => {
      this.newMessage.next(data.message);
      this.getUnreadCount().subscribe();
    });
  }

  private getHeaders(): HttpHeaders {
    const token = 
      localStorage.getItem('managerToken') || 
      localStorage.getItem('adminToken') || 
      localStorage.getItem('developerToken');
    
    if (!token) {
      console.warn('No authentication token found');
    }
    
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  }

  sendMessage(receiverId: string, receiverRole: string, content: string): Observable<Message> {
    const payload = {
      receiverId,
      receiverRole,
      content
    };
    return this.http.post<Message>(
      `${this.apiUrl}/send`, 
      payload, 
      { headers: this.getHeaders() }
    );
  }

  getConversation(otherUserId: string): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.apiUrl}/conversation/${otherUserId}`,
      { headers: this.getHeaders() }
    );
  }

  markAsRead(messageId: string): Observable<Message> {
    return this.http.patch<Message>(
      `${this.apiUrl}/read/${messageId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getUnreadCount(): Observable<number> {
    return new Observable(observer => {
      this.http.get<{ unreadCount: number }>(
        `${this.apiUrl}/unread`,
        { headers: this.getHeaders() }
      ).subscribe({
        next: (response) => {
          this.unreadCount.next(response.unreadCount);
          observer.next(response.unreadCount);
          observer.complete();
        },
        error: (error) => {
          console.error('Error fetching unread count:', error);
          observer.error(error);
        }
      });
    });
  }

  getUnreadCountUpdates(): Observable<number> {
    return this.unreadCount.asObservable();
  }

  getNewMessageUpdates(): Observable<Message | null> {
    return this.newMessage.asObservable();
  }

  joinRoom(userId: string): void {
    this.socket.emit('join', userId);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
