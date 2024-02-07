export function match(str: string, regex: RegExp): string[][] {
    let m: RegExpExecArray|null;
    let r: string[][] = [];

    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        const aggr: string[] = [];

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            aggr[groupIndex] = match;
            // console.log(`Found match, group ${groupIndex}: ${match}`);
        });

        r.push(aggr);
    }

    return r;
}