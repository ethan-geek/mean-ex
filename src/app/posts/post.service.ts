import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Post } from "./post.model";

@Injectable({
  providedIn: "root",
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  getPosts(): Post[] {
    return [...this.posts];
  }

  getPostsUpdatedListener(): Observable<Post[]> {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string): void {
    this.posts.push({
      title,
      content,
    });

    this.postsUpdated.next([...this.posts]);
  }
}
