import { Component } from '@angular/core';
import { UtilsService } from '../utils.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent {
  private requested: boolean = false;
  protected markdown: string = "";

  constructor(
    private utils: UtilsService
  ) {}

  ngOnInit(): void {
    if(this.requested) return;
    this.requested = true;
    this.markdown = "Loading...";

    this.utils.fetchFile("assets/home.md").subscribe({
      next: content => {
        this.markdown = content;
      },
      error: err => {
        this.markdown = "Request timed out! Please refresh page...";
        console.error("Home request timed out!");
        console.error(err);
      }
    }).add(() => {
      this.requested = false;
    })
  }
}
