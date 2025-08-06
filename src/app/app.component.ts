import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EmployeesTableComponent } from './employees/components/employees-table/employees-table.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, EmployeesTableComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'employee-crud-frontend';
}
