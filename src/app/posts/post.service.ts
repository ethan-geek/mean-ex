import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post } from './post.model';

import { environment } from 'src/environments/environment';

const BACKEND_POSTS_URL = environment.apiUrl + '/posts/';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number): void {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        BACKEND_POSTS_URL + queryParams
      )
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
            maxPosts: postData.maxPosts,
          };
        })
      )
      .subscribe((transformedPostData: { posts: Post[]; maxPosts: number }) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts,
        });
      });
  }

  getPostsUpdatedListener(): Observable<{ posts: Post[]; postCount: number }> {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string): Observable<{
    message: string;
    post: {
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    };
  }> {
    return this.http.get<{
      message: string;
      post: {
        _id: string;
        title: string;
        content: string;
        imagePath: string;
        creator: string;
      };
    }>(BACKEND_POSTS_URL + id);
  }
  addPost(title: string, content: string, file: File): void {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', file, title);

    this.http
      .post<{ message: string; post: Post }>(BACKEND_POSTS_URL, postData)
      .subscribe((data) => {
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
        creator: null,
      } as Post;
    }
    this.http.put(BACKEND_POSTS_URL + id, postData).subscribe((response) => {
      this.router.navigate(['/']);
    });
  }

  deletePost(postId: string): Observable<unknown> {
    return this.http.delete(BACKEND_POSTS_URL + postId);
  }
}
