import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post } from './post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  getPosts(): void {
    // return [...this.posts];
    this.http
      .get<{ message: string; posts: any }>('http://localhost:3000/api/posts')
      .pipe(
        map((postData) => {
          return postData.posts.map((post) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
            };
          });
        })
      )
      .subscribe((transformedPosts: Post[]) => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostsUpdatedListener(): Observable<Post[]> {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string): Post {
    return { ...this.posts.find((p) => p.id === id) };
  }
  addPost(title: string, content: string): void {
    const post = {
      id: null,
      title,
      content,
    };

    this.http
      .post<{ message: string; postId: string }>(
        'http://localhost:3000/api/posts',
        post
      )
      .subscribe((data) => {
        post.id = data.postId;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      });
  }

  updatePost(id: string, title: string, content: string): void {
    const post = {
      id,
      title,
      content,
    } as Post;

    this.http
      .put('http://localhost:3000/api/posts/' + id, post)
      .subscribe((response) => {
        console.log(response);
      });
  }

  deletePost(postId: string): void {
    this.http
      .delete('http://localhost:3000/api/posts/' + postId)
      .subscribe((data) => {
        this.posts = this.posts.filter((post) => post.id !== postId);
        this.postsUpdated.next([...this.posts]);
      });
  }
}
