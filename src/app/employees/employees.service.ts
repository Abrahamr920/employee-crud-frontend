import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Employee } from '../core/interfaces';

const API_URL = 'http://localhost:8080/api/employees';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private http = inject(HttpClient);

  getAllEmployees(): Observable<Employee[]> {
    return this.http
      .get<Employee[]>(API_URL)
      .pipe(tap((resp) => console.log('Resp', resp)));
  }
}
