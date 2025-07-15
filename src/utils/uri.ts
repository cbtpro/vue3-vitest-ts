/**
 * 解析给定 URL 中的查询参数，并返回一个包含所有参数的对象。
 * 如果某个参数值为 NaN、undefined 或 null，会输出警告信息，但仍然会将其包含在返回对象中。
 * 
 * @param {string} url - 要解析的 URL 字符串。
 * @returns {Record<string, string | string[]>} - 包含解析后的查询参数的对象。
 */
export function getQueryParams(url: string): Record<string, string | string[]> {
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);
  const queryParams: Record<string, string | string[]> = {};

  // 收集所有键值对（包括重复键）
  const paramEntries: Record<string, string[]> = {};
  params.forEach((value, key) => {
    if (!paramEntries[key]) {
      paramEntries[key] = [];
    }
    paramEntries[key].push(value);
  });

  // 处理每个键
  for (const [key, values] of Object.entries(paramEntries)) {
    if (values.length === 1) {
      const singleValue = values[0];
      // 尝试解析 JSON（如 `["value1","value2"]`）
      if (singleValue.startsWith('[') && singleValue.endsWith(']')) {
        try {
          const parsedArray = JSON.parse(singleValue);
          if (Array.isArray(parsedArray)) {
            queryParams[key] = parsedArray;
            continue;
          }
        } catch (e) {
          // 不是合法 JSON，按普通字符串处理
        }
      }
      // 尝试解析逗号分隔的字符串（如 `value1,value2`）
      if (singleValue.includes(',')) {
        queryParams[key] = singleValue.split(',').map(v => v.trim());
        continue;
      }
      // 普通字符串
      queryParams[key] = singleValue;
    } else {
      // 重复键模式（如 `params=value1&params=value2`）
      queryParams[key] = values;
    }

    // 检查异常值（NaN/undefined/null）
    if (typeof queryParams[key] === 'string') {
      const strValue = queryParams[key] as string;
      if (strValue === 'NaN' || strValue === 'undefined' || strValue === 'null') {
        console.warn(`警告: 参数 ${key} 的值为异常值 (${strValue})`);
      }
    }
  }

  return queryParams;
}

/**
* 将给定的参数对象拼接到基础 URL，并返回完整的 URL 字符串。
* 如果某个参数值为 NaN、undefined 或 null，会输出警告信息，但仍然会将其包含在 URL 中。
* 
* @param {string} baseUrl - 基础 URL。
* @param {Record<string, any>} params - 要拼接的参数对象。
* @returns {string} - 拼接参数后的完整 URL 字符串。
*/
export function setQueryParams(baseUrl: string, params: Record<string, any>): string {
  const urlObj = new URL(baseUrl);
  const urlParams = new URLSearchParams(urlObj.search);

  for (const [key, value] of Object.entries(params)) {
    const encodedKey = key;
    const encodedValue = value;

    if (Number.isNaN(value) || typeof value === 'undefined' || value === null) {
      console.warn(`警告: 参数 ${encodedKey} 的值为异常值 (${value})`);
    }
    urlParams.append(encodedKey, encodedValue);
  }

  urlObj.search = urlParams.toString();
  return urlObj.toString();
}
