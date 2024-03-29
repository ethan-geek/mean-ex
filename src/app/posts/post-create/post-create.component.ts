import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

import { Post } from '../post.model';
import { PostService } from '../post.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  post: Post | null;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;

  private mode = 'create';
  private postId: string;
  private authStatusSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService
      .getAuthStatusSubject()
      .subscribe((isAuthStatus) => {
        this.isLoading = false;
      });
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    });
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
            imagePath: data.post.imagePath,
            creator: data.post.creator,
          } as Post;
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            imagePath: this.post.imagePath,
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    const title = this.form.value.title;
    const content = this.form.value.content;
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postService.addPost(title, content, this.form.value.image);
    } else {
      this.postService.updatePost(
        this.postId,
        title,
        content,
        this.form.value.image
      );
    }

    this.form.reset();
  }

  onImagePicked(event: Event): void {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };

    // reader 프로세스 시작
    reader.readAsDataURL(file);
  }
}
