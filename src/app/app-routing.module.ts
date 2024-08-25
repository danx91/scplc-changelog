import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullListComponent } from './full-list/full-list.component';
import { HomeComponent } from './home/home.component';
import { ChangelogComponent } from './changelog/changelog.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'all', component: FullListComponent },
  { path: 'home', component: HomeComponent },
  { path: 'v/:ver', component: ChangelogComponent },
  { path: ':ver', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
