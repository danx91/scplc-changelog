import { Component } from '@angular/core';
import { ChangelogVersion, UtilsService } from '../utils.service';

@Component({
  selector: 'app-full-list',
  templateUrl: './full-list.component.html',
  styleUrls: ['./full-list.component.less']
})

export class FullListComponent {
  private requested: boolean = false;
  protected markdown: string = "";

  constructor(
    private utils: UtilsService
  ) {}

  ngOnInit(): void {
    if(this.requested) return;
    this.requested = true;
    this.markdown = "Loading...";

    this.utils.fetchManifest().subscribe({
      next: content => {
        let ma = 0, mi = 0, pa = 0;
        let md = "# List of all updates:"

        for(let item of content) {
          if(ma == item.major && mi == item.minor && pa == item.patch) {
            continue;
          }

          item = Object.assign({}, item);
          item.rev = 0;
          this.utils.updateVersionName(item);
          this.utils.updateVersionSignature(item);
          
          md = md + "\n* [" + item.name + "](v/" + item.signature + ")";

          ma = item.major;
          mi = item.minor;
          pa = item.patch;
        }

        this.markdown = md;
      },
      error: err => {
        this.markdown = "Request timed out! Please refresh page...";
        console.error("Full list request timed out!");
        console.error(err);
      }
    }).add(() => {
      this.requested = false;
    })
  }
}
