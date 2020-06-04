import { Injectable } from '@angular/core';
import { SocketClientService } from '../socket-client.service';
import { Observable } from 'rxjs/internal/Observable';
import { Client } from '@stomp/stompjs';
import { first, map, switchMap } from 'rxjs/operators';
import { Contact } from '../interface/contact.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private socketClient: SocketClientService) {
  }

  static getPostListing(post: any): Contact {
    const postedAt = new Date(post['postedAt']);
    return {...post, postedAt};
  }

  save(post: Contact) {
    return this.socketClient.send('/topic/posts/create', post);
  }

  onPost(): Observable<Contact> {
    return this.socketClient.onMessage('/topic/posts/created').pipe(map(post => PostService.getPostListing(post)));
  }

}
