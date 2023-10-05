import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FullListComponent } from './full-list/full-list.component';
import { HomeComponent } from './home/home.component';
import { ChangelogComponent } from './changelog/changelog.component';

@NgModule({
	declarations: [
		AppComponent,
		FullListComponent,
		HomeComponent,
		ChangelogComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		MarkdownModule.forRoot({
			loader: HttpClient,
		}),
	],
	providers: [],
	bootstrap: [AppComponent]
})

export class AppModule {}
