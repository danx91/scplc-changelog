import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FullListComponent } from './full-list/full-list.component';
import { HomeComponent } from './home/home.component';
import { ChangelogComponent } from './changelog/changelog.component';

function markedOptionsFactory(): MarkedOptions {
	const renderer = new MarkedRenderer()

	renderer.codespan = (text: string) => {
		return `<code class="inline-code">${text}</code>`
	}

	return {
		renderer: renderer,
	}
}

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
			markedOptions: {
				provide: MarkedOptions,
				useFactory: markedOptionsFactory
			}
		}),
	],
	providers: [],
	bootstrap: [AppComponent]
})

export class AppModule {}
