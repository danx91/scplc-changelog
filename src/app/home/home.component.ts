import { Component } from '@angular/core';
import { TimeoutError, UtilsService } from '../utils.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent {
  private requested: boolean = false;
  protected markdown: string = "";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private utils: UtilsService
  ) {}

  ngOnInit(): void {
    if(this.requested) return;
    this.requested = true;
    this.markdown = "Loading...";

    const id = this.route.snapshot.paramMap.get("ver");
    const path = id ? `assets/pages/${id}.md` : "assets/home.md"
    console.log(path);

    this.utils.fetchFile(path).subscribe({
      next: content => {
        this.markdown = content;
      },
      error: err => {
        if(err instanceof TimeoutError) {
          this.markdown = "Request timed out! Please refresh page...";
          console.error("Home request timed out!");
          console.error(err);
        } else if (err instanceof HttpErrorResponse) {
          this.markdown = `HTTP Error: ${err.status} ${err.statusText}`;
          console.error("HTTP Error!");
          console.error(err);
        } else {
          this.markdown = "Failed to load page!";
          console.error("Unknown error!");
          console.error(err);
        }
      }
    }).add(() => {
      this.requested = false;
    })
  }
}
