// declare moniker
declare module "moniker" {
  export interface Moniker {
    choose(): string;
  }
  export function generator(generators: ((() => string) | string)[]): Moniker;

  export const adjective: () => string;
  export const noun: () => string;
  export const verb: () => string;
}
