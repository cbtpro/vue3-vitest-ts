import { describe, it, expect, vi } from 'vitest';
import { getQueryParams, setQueryParams } from '@/utils/uri';

describe('getQueryParams', () => {
  it('解析参数', () => {
    const url = 'https://example.com?param1=value1&param2=value2';
    const params = getQueryParams(url);
    expect(params).toEqual({ param1: 'value1', param2: 'value2' });
  });

  it('解码参数', () => {
    // const url = 'https://example.com?param1=value%201&param2=value%202';
    const url = 'https://example.com/test?param1=value+1&param2=value+2';
    const params = getQueryParams(url);
    expect(params).toEqual({ param1: 'value 1', param2: 'value 2' });
  });
  it('解码数组参数/?params=value 1&params=value 2', () => {
    // /?params=value 1&params=value 2
    const url = 'https://example.com/?params=value%201&params=value%202';
    const params = getQueryParams(url);
    expect(params).toEqual({ params: ['value 1', 'value 2'] });
  });
  it('解码数组参数https://example.com/?params=["value 1","value 2"]', () => {
    // https://example.com/?params=["value 1","value 2"]
    const url = 'https://example.com/?params=%5B%22value%201%22%2C%22value%202%22%5D';
    const params = getQueryParams(url);
    expect(params).toEqual({ params: ['value 1', 'value 2'] });
  });
  it('解码数组参数["value 1","value 2"]', () => {
    const url = 'https://example.com/?params=value%201,value%202';
    const params = getQueryParams(url);
    // https://example.com/?params=["value 1","value 2"]
    expect(params).toEqual({ params: ['value 1', 'value 2'] });
  });

  it('异常值', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => { });
    const url = 'https://example.com?param1=NaN&param2=undefined&param3=null';
    const params = getQueryParams(url);
    expect(params).toEqual({ param1: 'NaN', param2: 'undefined', param3: 'null' });
    expect(warn).toHaveBeenCalledWith('警告: 参数 param1 的值为异常值 (NaN)');
    expect(warn).toHaveBeenCalledWith('警告: 参数 param2 的值为异常值 (undefined)');
    expect(warn).toHaveBeenCalledWith('警告: 参数 param3 的值为异常值 (null)');
    warn.mockRestore();
  });
});

describe('setQueryParams', () => {
  it('添加参数', () => {
    const baseUrl = 'https://example.com/test?param1=value1';
    const params = { param2: 'value2', param3: 'value3' };
    const url = setQueryParams(baseUrl, params);
    expect(url).toBe('https://example.com/test?param1=value1&param2=value2&param3=value3');
  });

  it('添加需要编码的参数', () => {
    const baseUrl = 'https://example.com';
    const params = { param1: 'value 1', param2: 'value 2' };
    const url = setQueryParams(baseUrl, params);
    expect(url).toBe('https://example.com/?param1=value+1&param2=value+2');
  });
  it('添加数组参数', () => {
    const baseUrl = 'https://example.com';
    const params = { param1: ['value 1', 'value 2'] };
    const url = setQueryParams(baseUrl, params);
    // https://example.com/?param1=value+1,value+2
    expect(url).toBe('https://example.com/?param1=value+1%2Cvalue+2');
  });
  it('添加异常值参数', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => { });
    const baseUrl = 'https://example.com';
    const params = { param1: 'value1', param2: undefined, param3: NaN, param4: null };
    const url = setQueryParams(baseUrl, params);
    expect(url).toBe('https://example.com/?param1=value1&param2=undefined&param3=NaN&param4=null');
    expect(warn).toHaveBeenCalledWith('警告: 参数 param2 的值为异常值 (undefined)');
    expect(warn).toHaveBeenCalledWith('警告: 参数 param3 的值为异常值 (NaN)');
    expect(warn).toHaveBeenCalledWith('警告: 参数 param4 的值为异常值 (null)');
    warn.mockRestore();
  });
  it('添加布尔值和数字', () => {
    const baseUrl = 'https://example.com';
    const params = { isEnabled: true, count: 42 };
    const url = setQueryParams(baseUrl, params);
    expect(url).toBe('https://example.com/?isEnabled=true&count=42');
  });

  it('添加数组混合类型参数', () => {
    const baseUrl = 'https://example.com';
    const params = { mixed: ['val1', 123, true, false] };
    const url = setQueryParams(baseUrl, params);
    // https://example.com/?mixed=val1,123,true,false
    expect(url).toBe('https://example.com/?mixed=val1%2C123%2Ctrue%2Cfalse');
  });

  it('添加值为0和空字符串', () => {
    const baseUrl = 'https://example.com';
    const params = { empty: '', zero: 0 };
    const url = setQueryParams(baseUrl, params);
    expect(url).toBe('https://example.com/?empty=&zero=0');
  });

  it('添加对象参数会转成 [object Object]', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => { });
    const baseUrl = 'https://example.com';
    const params = { config: { a: 1 } };
    const url = setQueryParams(baseUrl, params);
    // https://example.com/?config=[object+Object]
    expect(url).toBe('https://example.com/?config=%5Bobject+Object%5D');
    warn.mockRestore();
  });

  it('保留已有参数并追加新参数', () => {
    const baseUrl = 'https://example.com/path?existing=foo';
    const params = { added: 'bar' };
    const url = setQueryParams(baseUrl, params);
    expect(url).toBe('https://example.com/path?existing=foo&added=bar');
  });

});
