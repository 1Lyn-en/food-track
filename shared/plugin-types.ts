// ---- plugin:food_trace_bitable_import_export_1 ----
// ============================================================
// 插件 food_trace_bitable_import_export_1 (食迹应用多维表格导入导出) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface FoodTraceBitableImportExportOneAggregatequeryInput {
  /** [object Object] */
  measures?: {
    fieldName: string;
    aggregation: string;
    alias: string;
  }[];
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  pageSize?: number;
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conjunction: string;
    conditions: {
      fieldName: string;
      operator: string;
      value: string[];
    }[];
  };
  /** [object Object] */
  expandArrayDimension?: boolean;
  /** [object Object] */
  dimensions?: string[];
}

/**
 * capabilityClient.load('food_trace_bitable_import_export_1').call<FoodTraceBitableImportExportOneAggregatequeryOutput>('aggregateQuery', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { result, hasMore, pageToken } = result;
 * 返回值形如：
 *   {"result":[{}],"hasMore":false,"pageToken":"示例文本"}
 */
export interface FoodTraceBitableImportExportOneAggregatequeryOutput {
  /** [object Object] */
  result: {

  }[];
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
}

export interface FoodTraceBitableImportExportOneBatchaddrecordsInput {
  /** [object Object] */
  records: {
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('food_trace_bitable_import_export_1').call<FoodTraceBitableImportExportOneBatchaddrecordsOutput>('batchAddRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FoodTraceBitableImportExportOneBatchaddrecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FoodTraceBitableImportExportOneBatchupdaterecordsInput {
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('food_trace_bitable_import_export_1').call<FoodTraceBitableImportExportOneBatchupdaterecordsOutput>('batchUpdateRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FoodTraceBitableImportExportOneBatchupdaterecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FoodTraceBitableImportExportOneDeleterecordsInput {
  /** [object Object] */
  recordIDs: string[];
}

/**
 * capabilityClient.load('food_trace_bitable_import_export_1').call<FoodTraceBitableImportExportOneDeleterecordsOutput>('deleteRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { success } = result;
 * 返回值形如：
 *   {"success":false}
 */
export interface FoodTraceBitableImportExportOneDeleterecordsOutput {
  /** [object Object] */
  success: boolean;
}

export interface FoodTraceBitableImportExportOneGetrecordInput {
  /** [object Object] */
  recordID: string;
}

/**
 * capabilityClient.load('food_trace_bitable_import_export_1').call<FoodTraceBitableImportExportOneGetrecordOutput>('getRecord', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { id, record } = result;
 * 返回值形如：
 *   {"id":"示例文本","record":{}}
 */
export interface FoodTraceBitableImportExportOneGetrecordOutput {
  /** [object Object] */
  id: string;
  /** [object Object] */
  record?: {

  };
}

export interface FoodTraceBitableImportExportOneSearchrecordsInput {
  /** [object Object] */
  fieldNames?: string[];
  /** [object Object] */
  sort?: {
    desc: boolean;
    fieldName: string;
  }[];
  /** [object Object] */
  filter?: {
    conjunction: string;
    conditions: {
      fieldName: string;
      operator: string;
      value: string[];
    }[];
  };
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  pageSize?: number;
}

/**
 * capabilityClient.load('food_trace_bitable_import_export_1').call<FoodTraceBitableImportExportOneSearchrecordsOutput>('searchRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { hasMore, pageToken, total, ... } = result;
 * 返回值形如：
 *   {"hasMore":false,"pageToken":"示例文本","total":0,"records":[{"id":"示例文本","record":{}}]}
 */
export interface FoodTraceBitableImportExportOneSearchrecordsOutput {
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  total?: number;
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
}
// ---- end:food_trace_bitable_import_export_1 ----