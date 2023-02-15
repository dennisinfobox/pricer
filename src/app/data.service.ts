import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  myData: any;

  constructor(private http: HttpClient) { }
  

  fetchData(): Observable<any> {
    return this.http.get<any>('assets/data-mock.json');
  }

  getData(): Observable<any> {
    if (this.myData) {
      return of(this.myData);
    } else {
      return this.fetchData();
    }
  }
}