import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, tap } from 'rxjs';
import { SearchSvgComponent } from '../../../shared/search-svg/search-svg.component';
import { EmployeesService } from '../../employees.service';

@Component({
  selector: 'employees-table',
  imports: [CurrencyPipe, DatePipe, SearchSvgComponent, ReactiveFormsModule],
  templateUrl: './employees-table.component.html',
})
export class EmployeesTableComponent {
  employeeService = inject(EmployeesService);

  searchControl = new FormControl('');
  searchTerm = signal('');
  showDeleteConfirm = signal<number | null>(null);

  employeesResource = rxResource({
    loader: () =>
      this.employeeService
        .getEmployees()
        .pipe(tap((resp) => console.log('Resp', resp))),
  });

  // Empleados filtrados basados en la búsqueda
  filteredEmployees = computed(() => {
    const employees = this.employeesResource.value() || [];
    const term = this.searchTerm();
    return this.employeeService.searchEmployees(employees, term);
  });

  constructor() {
    // Suscribirse a cambios en el campo de búsqueda
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Esperar 300ms después de que el usuario deje de escribir
        distinctUntilChanged() // Solo emitir si el valor cambió
      )
      .subscribe((value) => {
        this.searchTerm.set(value || '');
      });

    // Suscribirse a cambios en empleados para refrescar la tabla
    this.employeeService.employeeChange$.subscribe(() => {
      this.employeesResource.reload();
    });
  }

  // Método para limpiar la búsqueda
  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchTerm.set('');
  }

  // Método para obtener el término de búsqueda actual
  getCurrentSearchTerm(): string {
    return this.searchTerm();
  }

  // Método para verificar si hay búsqueda activa
  hasActiveSearch(): boolean {
    return this.searchTerm().length > 0;
  }

  // Método para reintentar la carga de empleados
  retryLoad(): void {
    this.employeesResource.reload();
  }

  // Método para editar empleado
  editEmployee(employee: any): void {
    // Notificar al formulario para cargar el empleado
    this.employeeService.notifyEditEmployee(employee);
  }

  // Método para confirmar eliminación
  confirmDelete(employeeId: number): void {
    this.showDeleteConfirm.set(employeeId);
  }

  // Método para cancelar eliminación
  cancelDelete(): void {
    this.showDeleteConfirm.set(null);
  }

  // Método para eliminar empleado
  deleteEmployee(employeeId: number): void {
    this.employeeService
      .deleteEmployee(employeeId)
      .pipe(
        tap(() => {
          console.log('Empleado eliminado exitosamente');
          // Recargar la lista de empleados
          this.employeesResource.reload();
          this.showDeleteConfirm.set(null);
        }),
        catchError((error) => {
          console.error('Error al eliminar empleado:', error);
          return of(null);
        })
      )
      .subscribe();
  }
}
