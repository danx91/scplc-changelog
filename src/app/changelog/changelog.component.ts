import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ChangelogVersion, UtilsService } from '../utils.service';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.less']
})

export class ChangelogComponent {
  private requested: boolean = false;
  private manifest: ChangelogVersion[] = [];
  protected versions: ChangelogVersion[] = [];
  protected markdown: string = "";
  protected active: string = "";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private utils: UtilsService
  ) {
    router.events.subscribe(val => {
      if(val instanceof NavigationEnd && val.url.startsWith("/v/")) {
        this.initializeChangelog();
      }
    })
  }

  updateView(): void {
    if(this.requested) return;

    if(this.manifest.length === 0) {
      this.markdown = "Manifest is empty.";
      return;
    }

    let id = this.route.snapshot.paramMap.get("ver") || "err";
    let obj: ChangelogVersion | undefined;

    if(id === "latest") {
      obj = this.manifest[0];
    } else if(id !== "next") {
      obj = this.utils.parseVersion(id);
    }

    const observableList: Observable<string>[] = [];
    const objectsList: ChangelogVersion[] = [];

    if(id === "next") {
      observableList.push(this.utils.fetchFile("assets/changelogs/next.md"));
    } else {
      for(const item of this.manifest) {
        if(item.major === obj!.major && item.minor === obj!.minor && item.patch === obj!.patch && (obj!.rev == 0 || item.rev == obj!.rev)) {
          observableList.push(this.utils.fetchFile("assets/changelogs/" + item.signature + ".md"));
          objectsList.push(item);
        }
      }
    }

    if(observableList.length == 0){
        console.log("Unknown version: " + id + "! Redirecting to latest...");
        this.router.navigate(["/v/latest"]);
        return;
    }

    this.active = "";
    this.requested = true;
    this.markdown = "Loading...  \n> Changelog: " + id + " : " + new Date().getTime();

    forkJoin(observableList).subscribe({
      next: results => {
        this.requested = false;
        let md = "";
        let first = true;
        
        for(let index = results.length - 1; index >= 0 ; --index) {
          const item = results[index];
          const cv = objectsList[index];
          if(!first) {
            md = md + "<br><br><br>";
          }

          if(cv) {
            md = md + "\n# " + cv.name + "\n\n---\n";
          }

          md = md + "\n" + item + "\n";

          first = false;
        }

        const tmp = Object.assign({}, obj);
        tmp.rev = 0;
        this.utils.updateVersionSignature(tmp);

        this.active = tmp.signature;
        this.markdown = md;
      },
      error: err => {
        this.requested = false;
        this.markdown = "Request error!";
        console.error("Changelog request error!");
        console.error(err);
      }
    });
  }

  initializeChangelog(): void {
    if(this.manifest.length > 0) {
      this.updateView();
      return;
    }

    if(this.requested) return;
    this.requested = true;
    this.markdown = "Loading...  \n> Manifest";

    this.utils.fetchManifest().subscribe({
      next: content => {
        this.requested = false;
        this.manifest = content;
        this.versions = [];

        let ma = 0, mi = 0, pa = 0;

        for(const item of content) {
          if(ma == item.major && mi == item.minor && pa == item.patch) {
            continue;
          }

          const tmp = Object.assign({}, item);
          tmp.rev = 0;
          this.utils.updateVersionName(tmp);
          this.utils.updateVersionSignature(tmp);

          if(this.versions.length < 10){
            this.versions.push(tmp);
          }

          ma = item.major;
          mi = item.minor;
          pa = item.patch;
        }

        this.updateView()
      },
      error: err => {
        this.requested = false;
        this.markdown = "Request timed out! Please refresh page...";
        console.error("Manifest request timed out!");
        console.error(err);
      }
    });
  }
}
