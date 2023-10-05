import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap, throwError, timeout } from 'rxjs';

class TimeoutError extends Error {
  constructor() {
    super("Request timed out!");
    this.name = "TimeoutError";
  }
}

export interface ChangelogVersion {
  signature: string,
  name: string,
  realm: string,
  major: number,
  minor: number,
  patch: number,
  rev: number
}

interface Realm {
  [key: string]: string
}

@Injectable({
  providedIn: 'root'
})

export class UtilsService {
  private manifest?: ChangelogVersion[];
  private cache: Map<string, string> = new Map<string, string>();

  constructor(
    private http: HttpClient
  ) {}

  private realms: Realm = {
    "b": "Beta",
    "r": "Release"
  }

  updateVersionName(ver: ChangelogVersion): void {
    ver.name = "";

    if(this.realms[ver.realm]) {
      ver.name = this.realms[ver.realm] + " ";
    }

    ver.name = ver.name + ver.major + "." + ver.minor + "." + ver.patch;

    if(ver.rev > 0) {
      ver.name = ver.name + " rev. " + ver.rev;
    }
  }

  updateVersionSignature(ver: ChangelogVersion): void {
    ver.signature = ver.realm + ("0" + ver.major).slice(-2) + ("0" + ver.minor).slice(-2) + ("0" + ver.patch).slice(-2) + "r" + ver.rev;
  }

  parseVersion(sig: string): ChangelogVersion {
    const match = sig.match(/^([a-z])(\d\d)(\d\d)(\d\d)r(\d+)$/i);

    if(!match) {
      return {
        signature: sig,
        name: "Invalid Version",
        realm: "i",
        major: 0,
        minor: 0,
        patch: 0,
        rev: 0
      }
    }

    const realm = match[1];
    const major = Number(match[2]);
    const minor = Number(match[3]);
    const patch = Number(match[4]);
    const rev = Number(match[5]);

    if(isNaN(major) || isNaN(minor) || isNaN(patch) || isNaN(rev)) {
      return {
        signature: sig,
        name: "Invalid Version",
        realm: "i",
        major: 0,
        minor: 0,
        patch: 0,
        rev: 0
      }
    }

    const ver = {
      signature: sig,
      name: "Invalid Version",
      realm: realm,
      major: major,
      minor: minor,
      patch: patch,
      rev: rev
    };

    this.updateVersionName(ver);

    return ver;
  }

  fetchFile(file: string): Observable<string> {
    if(this.cache.get(file)) {
      return new Observable<string>(observer => {
        observer.next(this.cache.get(file));
        observer.complete();
      });
    }

    return this.http.get(file, {responseType: "text"}).pipe(
      timeout({
        each: 5000,
        with: () => throwError(() => new TimeoutError())
      }),
      tap(content => {
        this.cache.set(file, content);
      })
    );
  }

  fetchManifest(): Observable<ChangelogVersion[]> {
    if(this.manifest) {
      return new Observable<ChangelogVersion[]>(observer => {
        observer.next(this.manifest);
        observer.complete();
      });
    }

    return this.http.get<Array<string>>("assets/changelogs/manifest.json", {
      headers: new HttpHeaders({
        "Cache-Control": "no-cache, no-store, must-revalidate, post-check=0, pre-check=0",
        "Pragma": "no-cache",
        "Expires": "0"
      }),
    }).pipe(
      timeout({
        each: 5000,
        with: () => throwError(() => new TimeoutError())
      }),
      map((content: Array<string>) => {
        const result: ChangelogVersion[] = [];

        for(const item of content) {
          result.push(this.parseVersion(item.slice(0, -3)))
        }

        result.sort((a, b) => {
          if (a.major != b.major) return b.major - a.major;
          if (a.minor != b.minor) return b.minor - a.minor;
          if (a.patch != b.patch) return b.patch - a.patch;
          if (a.rev != b.rev) return a.rev - b.rev;

          return 0;
        });

        return result;
      }),
      tap(content => {
        this.manifest = content;
      })
    );
  }
}
