import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
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
}
