export interface BasicPageListParams {
  pageNo?: number;
  pageSize?: number;
  code?: string;
  id?: string | number;
}

export interface BaseResponse<T = any> {
  code: number;
  result: T;
  message: string;
  success: boolean;
}
