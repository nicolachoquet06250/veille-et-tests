import {match} from '../regex';

export * from './functions';

export const toTagName = (functionName: string): string => match(
    functionName.substring(0, 1).toUpperCase() + functionName.substring(1),
    /([A-Z0-9][a-z]*)/g
).map(e => e[0].toLowerCase()).join('-');