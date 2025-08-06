export interface Employee {
  id: number;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  position: Position;
  salary: number;
  hireDate: Date;
  state: string;
}

export interface Position {
  id: number;
  name: string;
}
