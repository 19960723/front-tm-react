export interface BasicPageListParams {
  pageNo?: number;
  pageSize?: number;
  code?: string;
  id?: string | number;
  [key: string]: unknown; // 如果确实有完全不确定且不会被直接访问的额外参数，可以使用索引签名作为“逃生舱”，但要慎用
}

export interface BaseResponse<T = unknown> {
  code: number;
  result: T;
  message: string;
  success: boolean;
}
