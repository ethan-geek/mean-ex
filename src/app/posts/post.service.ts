import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Post } from "./post.model";

@Injectable({
  providedIn: "root",
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  getPosts(): void {
    // return [...this.posts];
    this.http
      .get<{ message: string; posts: Post[] }>(
        "http://localhost:3000/api/posts"
      )
      .subscribe((data: { message: string; posts: Post[] }) => {
        this.posts = data.posts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostsUpdatedListener(): Observable<Post[]> {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string): void {
    const post = {
      id: null,
      title,
      content,
    };

    this.http
      .post<{ message: string }>("http://localhost:3000/api/posts", post)
      .subscribe((data) => {
        console.log(data.message);
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      });
  }
}
