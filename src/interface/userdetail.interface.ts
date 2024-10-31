export interface IUserDetail {
  data: UserDetail;
  token: string;
}

export interface UserDetail {
  user_id: string;
  email: string;
  firstname: string;
  role: string;
  lastname: string;
  phone: string;
  profile_image_url: string;
}
