import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { SearchSvgComponent } from '../../../shared/search-svg/search-svg.component';
import { EmployeesService } from '../../employees.service';

@Component({
  selector: 'employees-table',
  imports: [CurrencyPipe, DatePipe, SearchSvgComponent],
  templateUrl: './employees-table.component.html',
})
export class EmployeesTableComponent {
  employeeService = inject(EmployeesService);

  employeesResource = rxResource({
    loader: () =>
      this.employeeService
        .getEmployees()
        .pipe(tap((resp) => console.log('Resp', resp))),
  });
}
