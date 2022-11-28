import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post } from './post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}

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
              imagePath: post.imagePath,
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

  getPost(id: string): Observable<{
    message: string;
    post: { _id: string; title: string; content: string; imagePath: string };
  }> {
    return this.http.get<{
      message: string;
      post: { _id: string; title: string; content: string; imagePath: string };
    }>('http://localhost:3000/api/posts/' + id);
  }
  addPost(title: string, content: string, file: File): void {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', file, title);

    this.http
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe((data) => {
        const post: Post = {
          id: data.post.id,
          title,
          content,
          imagePath: data.post.imagePath,
        };
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  updatePost(
    id: string,
    title: string,
    content: string,
    image: File | string
  ): void {
    let postData: FormData | Post;

    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id,
        title,
        content,
        imagePath: image,
      } as Post;
    }
    this.http
      .put('http://localhost:3000/api/posts/' + id, postData)
      .subscribe((response) => {
        const updatedPost = [...this.posts];
        const findIdx = updatedPost.findIndex((p) => p.id === id);
        const post: Post = {
          id,
          title,
          content,
          imagePath: '',
        } as Post;
        updatedPost[findIdx] = post;
        this.posts = updatedPost;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
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
