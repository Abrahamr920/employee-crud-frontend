import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { catchError, of, tap } from 'rxjs';
import { EmployeesService } from '../../employees.service';

@Component({
  selector: 'employees-form',
  imports: [NgxMaskDirective, ReactiveFormsModule, CommonModule],
  providers: [provideNgxMask()],
  templateUrl: './employees-form.component.html',
})
export class EmployeesFormComponent {
  employeeService = inject(EmployeesService);
  statuses: string[] = ['ACTIVO', 'INACTIVO', 'LICENCIA', 'VACACIONES'];

  submitted = false;
  isEditing = signal(false);
  currentEmployeeId = signal<number | null>(null);
  isLoading = signal(false);
  message = signal<{ text: string; type: 'success' | 'error' } | null>(null);

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
    positionId: [null, Validators.required],
    salary: [null, [Validators.required, Validators.min(0)]],
    hireDate: ['', Validators.required],
    state: ['', Validators.required],
  });

  constructor() {
    // Suscribirse a eventos de edición de empleados
    this.employeeService.editEmployee$.subscribe((employee) => {
      this.loadEmployeeForEdit(employee);
    });
  }

  // Método para cargar empleado para edición
  loadEmployeeForEdit(employee: any): void {
    this.isEditing.set(true);
    this.currentEmployeeId.set(employee.id);

    // Formatear la fecha para el input date
    const hireDate = new Date(employee.hireDate);
    const formattedDate = hireDate.toISOString().split('T')[0];

    this.employeeForm.patchValue({
      id: employee.id,
      name: employee.name,
      lastname: employee.lastname,
      email: employee.email,
      phone: employee.phone,
      positionId: employee.position.id,
      salary: employee.salary,
      hireDate: formattedDate,
      state: employee.state,
    });
  }

  // Método para limpiar el formulario
  clearForm(): void {
    this.employeeForm.reset();
    this.submitted = false;
    this.isEditing.set(false);
    this.currentEmployeeId.set(null);
    this.message.set(null);
  }

  // Método para crear nuevo empleado
  createEmployee(employeeData: any): void {
    this.isLoading.set(true);
    this.message.set(null);

    // Preparar datos para crear (sin ID)
    const { id, positionId, ...employeeToCreate } = employeeData;

    // Mapear positionId a la estructura que espera la API
    const employeeWithPosition = {
      ...employeeToCreate,
      position: {
        id: positionId,
        name: this.getPositionNameById(positionId),
      },
    };

    this.employeeService
      .createEmployee(employeeWithPosition)
      .pipe(
        tap(() => {
          this.message.set({
            text: 'Empleado creado exitosamente',
            type: 'success',
          });
          this.clearForm();
          // Notificar cambio para refrescar la tabla
          this.employeeService.notifyEmployeeChange();
        }),
        catchError((error) => {
          console.error('Error al crear empleado:', error);
          this.message.set({
            text: 'Error al crear empleado. Intente nuevamente.',
            type: 'error',
          });
          return of(null);
        })
      )
      .subscribe(() => {
        this.isLoading.set(false);
      });
  }

  // Método para actualizar empleado existente
  updateEmployee(employeeData: any): void {
    if (!this.currentEmployeeId()) return;

    this.isLoading.set(true);
    this.message.set(null);

    // Mapear positionId a la estructura que espera la API
    const { positionId, ...employeeToUpdate } = employeeData;
    const employeeWithPosition = {
      ...employeeToUpdate,
      position: {
        id: positionId,
        name: this.getPositionNameById(positionId),
      },
    };

    this.employeeService
      .updateEmployee(this.currentEmployeeId()!, employeeWithPosition)
      .pipe(
        tap(() => {
          this.message.set({
            text: 'Empleado actualizado exitosamente',
            type: 'success',
          });
          this.clearForm();
          // Notificar cambio para refrescar la tabla
          this.employeeService.notifyEmployeeChange();
        }),
        catchError((error) => {
          console.error('Error al actualizar empleado:', error);
          this.message.set({
            text: 'Error al actualizar empleado. Intente nuevamente.',
            type: 'error',
          });
          return of(null);
        })
      )
      .subscribe(() => {
        this.isLoading.set(false);
      });
  }

  // Método para manejar el envío del formulario
  onSubmit(): void {
    this.submitted = true;
    this.message.set(null);

    if (this.employeeForm.valid) {
      const employee = this.employeeForm.value;

      if (this.isEditing()) {
        this.updateEmployee(employee);
      } else {
        this.createEmployee(employee);
      }
    } else {
      console.warn('Formulario inválido');
      this.employeeForm.markAllAsTouched();
    }
  }

  // Método para cancelar edición
  cancelEdit(): void {
    this.clearForm();
  }

  // Método para obtener el nombre de la posición por ID
  private getPositionNameById(positionId: number): string {
    const positions = this.positionsResource.value();
    const position = positions?.find((pos) => pos.id === positionId);
    return position?.name || '';
  }
}
