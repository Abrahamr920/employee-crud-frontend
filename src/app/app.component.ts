import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EmployeesFormComponent } from './employees/components/employees-form/employees-form.component';
import { EmployeesTableComponent } from './employees/components/employees-table/employees-table.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, EmployeesTableComponent, EmployeesFormComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'employee-crud-frontend';
}
