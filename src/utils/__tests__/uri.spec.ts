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
  it('解码数组参数', () => {
    const url = 'https://example.com/?params=value%201&params=value%202';
    const params = getQueryParams(url);
    expect(params).toEqual({ params: ['value 1', 'value 2'] });
  });
  it('解码数组参数1', () => {
    const url = 'https://example.com/?params=%5B%22value%201%22%2C%22value%202%22%5D';
    const params = getQueryParams(url);
    expect(params).toEqual({ params: ['value 1', 'value 2'] });
  });
  it('解码数组参数2', () => {
    const url = 'https://example.com/?params=value%201,value%202';
    const params = getQueryParams(url);
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

});
