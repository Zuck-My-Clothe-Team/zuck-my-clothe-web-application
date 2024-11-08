export interface IMachine {
  machine_serial: string;
  machine_label: string | number;
  branch_id: string;
  machine_type: MachineType;
  is_active: boolean;
  weight: number;
}

export enum MachineType {
  WASHER = "Washer",
  DRYER = "Dryer",
}
