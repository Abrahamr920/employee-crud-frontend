import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { Employee, Position } from '../core/interfaces';

const API_URL = 'http://localhost:8080/api/employees';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private http = inject(HttpClient);

  // Subject para comunicación entre componentes
  private employeeChangeSubject = new Subject<void>();
  private editEmployeeSubject = new Subject<Employee>();

  // Observables para comunicación
  employeeChange$ = this.employeeChangeSubject.asObservable();
  editEmployee$ = this.editEmployeeSubject.asObservable();

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

  // Crear nuevo empleado
  createEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    return this.http.post<Employee>(API_URL, employee);
  }

  // Actualizar empleado existente
  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${API_URL}/${id}`, employee);
  }

  // Eliminar empleado
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }

  // Obtener empleado por ID
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${API_URL}/${id}`);
  }

  // Métodos para comunicación entre componentes
  notifyEmployeeChange(): void {
    this.employeeChangeSubject.next();
  }

  notifyEditEmployee(employee: Employee): void {
    this.editEmployeeSubject.next(employee);
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
