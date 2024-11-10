import { IBranch } from "./branch.interface";

export interface IReport {
  branch: IBranch;
  created_at: string;
  deleted_at: string;
  machine_serial: string;
  report_desc: string;
  report_id: string;
  report_status: string;
  user_id: string;
}

export interface IReportUpdateDTO {
  report_id: string;
  report_status: string;
}

export enum ReportStatus {
  Pending = "Pending",
  InProgress = "In progress",
  Fixed = "Fixed",
  Canceled = "Canceled",
}
