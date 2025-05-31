import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

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
  private ws: WebSocket | null = null;
  private apiUrl = 'http://localhost:4000/api/message';
  private unreadCount = new BehaviorSubject<number>(0);
  private newMessage = new BehaviorSubject<Message | null>(null);
  private wsUrl = 'ws://localhost:4000';

  constructor(private http: HttpClient) {
    this.initializeWebSocket();
  }

  private initializeWebSocket(): void {
    const token = this.getToken();
    if (!token) {
      console.error('No token available for WebSocket connection');
      return;
    }

    this.ws = new WebSocket(`${this.wsUrl}?token=${token}`);

    this.ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'newMessage') {
          this.newMessage.next(data.data);
          this.getUnreadCount().subscribe();
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected. Attempting to reconnect...');
      setTimeout(() => this.initializeWebSocket(), 5000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private getToken(): string | null {
    return localStorage.getItem('managerToken') || 
           localStorage.getItem('adminToken') || 
           localStorage.getItem('developerToken') ||
           localStorage.getItem('marketerToken') ||
           localStorage.getItem('digitalMarketingToken') ||
           localStorage.getItem('contentCreatorToken') ||
           localStorage.getItem('clientToken');
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  }

  sendMessage(receiverId: string, receiverRole: string, content: string): Observable<Message> {
    const roleMapping: { [key: string]: string } = {
      'admin': 'admin',
      'manager': 'manager',
      'developer': 'developer',
      'contentCreator': 'content-creator',
      'digitalMarketing': 'digital-marketing',
      'marketer': 'digital-marketing',
      'client': 'client'
    };

    const mappedRole = roleMapping[receiverRole] || receiverRole;
    const payload = {
      receiverId,
      receiverRole: mappedRole,
      content
    };

    // Send through WebSocket for immediate delivery
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        data: payload
      }));
    }
    
    // Send through HTTP for persistence
    return this.http.post<Message>(
      `${this.apiUrl}/send`, 
      payload, 
      { headers: this.getHeaders() }
    );
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
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
    return this.http.get<{ unreadCount: number }>(
      `${this.apiUrl}/unread`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.unreadCount)
    );
  }

  getUnreadCountUpdates(): Observable<number> {
    return this.unreadCount.asObservable();
  }

  getNewMessageUpdates(): Observable<Message | null> {
    return this.newMessage.asObservable();
  }

  getMessagedUsers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/users`,
      { headers: this.getHeaders() }
    );
  }
}
