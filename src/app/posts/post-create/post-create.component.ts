import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";

import { Post } from "../post.model";
import { PostService } from "../post.service";

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"],
})
export class PostCreateComponent {
  enteredTitle = "";
  enteredContent = "";

  constructor(private postService: PostService) {}

  onAddPost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.postService.addPost(form.value.title, form.value.content);
    form.resetForm();
  }
}
