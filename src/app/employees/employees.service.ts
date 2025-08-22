import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Employee, Position } from '../core/interfaces';

const API_URL = 'http://localhost:8080/api/employees';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private http = inject(HttpClient);

  getEmployees(): Observable<Employee[]> {
    return this.http
      .get<Employee[]>(API_URL)
      .pipe(tap((resp) => console.log('Resp', resp)));
  }

  getPositions(): Observable<Position[]> {
    return this.http
      .get<Position[]>(`${API_URL}/positions`)
      .pipe(tap((resp) => console.log('Resp', resp)));
  }

  searchEmployees(employees: Employee[], searchTerm: string): Employee[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return employees;
    }

    const term = searchTerm.toLowerCase().trim();
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(term) ||
        employee.lastname.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term) ||
        employee.position.name.toLowerCase().includes(term) ||
        employee.phone.includes(term)
    );
  }
}
