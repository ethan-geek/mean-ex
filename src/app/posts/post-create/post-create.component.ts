import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Post } from '../post.model';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
  enteredTitle = '';
  enteredContent = '';
  post: Post | null;
  isLoading = false;

  private mode = 'create';
  private postId: string;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe((data) => {
          this.isLoading = false;
          this.post = {
            id: data.post._id,
            title: data.post.title,
            content: data.post.content,
          } as Post;
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }
  onSavePost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    const title = form.value.title;
    const content = form.value.content;
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postService.addPost(title, content);
    } else {
      this.postService.updatePost(this.postId, title, content);
    }

    form.resetForm();
  }
}
