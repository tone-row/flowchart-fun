type StyleObject = Record<string, Record<string, string>>;

function stringifyStyleObject(styleObj: StyleObject) {
  return Object.entries(styleObj)
    .map(([selector, style]) => {
      const styleString = Object.entries(style)
        .map(([property, value]) => `${property}: ${value};`)
        .join(" ");
      return `${selector} { ${styleString} }`;
    })
    .join("\n");
}

export function cyStyleToString(stylesheet: Style[]) {
  const styleObj: StyleObject = {};
  for (const declaration of Array.from(stylesheet)) {
    const { selector, properties } = declaration;
    if (!properties) continue;
    if (styleObj[selector.inputText]) {
      // If the selector already exists, merge the new properties with the existing ones
      styleObj[selector.inputText] = {
        ...styleObj[selector.inputText],
        ...properties.reduce((acc, property) => {
          acc[property.name] = property.strValue;
          return acc;
        }, {} as Record<string, string>),
      };
    } else {
      // Otherwise, add the new selector and properties to the style object
      styleObj[selector.inputText] = properties.reduce((acc, property) => {
        acc[property.name] = property.strValue;
        return acc;
      }, {} as Record<string, string>);
    }
  }
  return stringifyStyleObject(styleObj);
}

interface Style {
  selector: Selector;
  properties?: PropertiesEntity[] | null;
  mappedProperties?: (PropertiesEntityOrMappedPropertiesEntity | null)[] | null;
  index: number;
}
interface Selector {
  inputText: string;
  currentSubject?: null;
  compoundCount: number;
  edgeCount: number;
  length: number;
}
interface PropertiesEntity {
  name: string;
  value?:
    | string
    | (number | string)[]
    | null
    | number
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | (string | number)[]
    | null
    | string
    | number
    | number
    | (number | string)[]
    | null
    | string
    | string
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | string
    | string[]
    | null
    | string[]
    | null
    | number
    | string;
  strValue: string;
  pfValue?:
    | number[]
    | null
    | number
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number[]
    | null
    | number
    | number
    | number[]
    | null
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | number[]
    | null
    | number
    | string[]
    | null
    | number;
  units?: null[] | null | string | null;
  mapped?: Mapped | null;
  field?: string | null;
}
interface Mapped {
  mapping: boolean;
  regex: string;
}
interface PropertiesEntityOrMappedPropertiesEntity {
  name: string;
  value?: string[] | null;
  strValue: string;
  mapped: Mapped1;
  field: string;
}
interface Mapped1 {
  mapping: boolean;
  regex: string;
}
