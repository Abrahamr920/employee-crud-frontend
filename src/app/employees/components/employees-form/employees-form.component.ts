import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { tap } from 'rxjs';
import { EmployeesService } from '../../employees.service';

@Component({
  selector: 'employees-form',
  imports: [NgxMaskDirective, ReactiveFormsModule, CommonModule], // Importa la directiva aquí
  providers: [provideNgxMask()], // Provee el servicio de ngx-mask
  templateUrl: './employees-form.component.html',
})
export class EmployeesFormComponent {
  employeeService = inject(EmployeesService);
  statuses: string[] = ['ACTIVO', 'INACTIVO', 'LICENCIA', 'VACACIONES'];
  fb = inject(FormBuilder);
  positionsResource = rxResource({
    loader: () =>
      this.employeeService
        .getPositions()
        .pipe(tap((resp) => console.log('Resp', resp))),
  });

  employeeForm = this.fb.group({
    id: [0],
    name: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    position: this.fb.group({
      id: [null, Validators.required],
      name: [''],
    }),
    salary: [null, [Validators.required, Validators.min(0)]],
    hireDate: [null, Validators.required],
    state: ['', Validators.required],
  });

  onSubmit() {
    if (this.employeeForm.valid) {
      const employee = this.employeeForm.value;
      console.log('Empleado enviado', employee);
    } else {
      console.warn('Formulario inválido');
      this.employeeForm.markAllAsTouched();
    }
  }
}
