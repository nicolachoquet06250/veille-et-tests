export const getFunctionName = (fn: Function) => fn.name;
export const getFunctionParameters = (fn: Function) => {
    const parameterRegex = /function\s*\w*\s*\(([^)]*)\)/;
    const match = fn.toString().match(parameterRegex);

    let params: string[] = [];

    if (match && match[1]) {
        // Split the parameter string by commas and trim the whitespace
        params = match[1].split(',').map((param: string) => param.trim());
        params = params.map((param, i) => {
            if (i === 0) {
                return param.substring(1);
            } else if (i === params.length - 1) {
                return param.substring(0, param.length - 1);
            }
            return param;
        }).map(param => param.trim().split('=').shift()?.trim() ?? '');
    }

    return params;
};

export function getParentFunctionName(current: string) {
    try {
        throw new Error();
    } catch (err) {
        // console.log((err as Error).stack?.split('\n').map(e => e.trim()), current);

        let isNext = false;
        for (const item of (err as Error).stack?.split('\n').map(e => e.trim()) ?? []) {
            if (item.startsWith(`at ${current}`)) {
                isNext = true;
                continue;
            }

            if (isNext) {
                return item.split(' ')[1];
            }
        }
    }

    return '';
}