import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { EmployeesService } from '../../employees.service';

@Component({
  selector: 'employees-table',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './employees-table.component.html',
})
export class EmployeesTableComponent {
  employeeService = inject(EmployeesService);

  employeesResource = rxResource({
    loader: () =>
      this.employeeService
        .getAllEmployees()
        .pipe(tap((resp) => console.log('Resp', resp))),
  });
}
