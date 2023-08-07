export enum JsonType {
  Str,
  Num,
  Bool,
  Null,
  Obj,
  Arr,
}

export function isPrimitiveType(val: JsonVal): boolean {
  return (
    val.t === JsonType.Str ||
    val.t === JsonType.Num ||
    val.t === JsonType.Bool ||
    val.t === JsonType.Null
  );
}

export type JsonVal = Str | Num | Bool | Null | Obj | Arr;

type Null = {
  t: JsonType.Null;
  value: null;
};

type Str = {
  t: JsonType.Str;
  value: string;
};

type Num = {
  t: JsonType.Num;
  value: number;
};

type Bool = {
  t: JsonType.Bool;
  value: boolean;
};

export type ObjVal = Record<string, JsonVal>;

type Obj = {
  t: JsonType.Obj;
  value: ObjVal;
};

type Arr = {
  t: JsonType.Arr;
  value: JsonVal[];
};

// RESOLVE FUNCTION

function resolveObj(objVal: Obj) {
  return Object.keys(objVal.value).reduce<Record<string, unknown>>(function (
    acc,
    key
  ) {
    acc[key] = resolveVal(objVal.value[key]);
    return acc;
  },
  {});
}

function resolveArr(arrVal: Arr) {
  return arrVal.value.map(resolveVal);
}

export function resolveVal(jsonVal: JsonVal): unknown {
  if (jsonVal.t === JsonType.Obj) {
    return resolveObj(jsonVal);
  }

  if (jsonVal.t === JsonType.Arr) {
    return resolveArr(jsonVal);
  }

  return jsonVal.value;
}

// PARSE FUNCTION

function parseArr(value: unknown[]): JsonVal {
  return { value: value.map(parseVal), t: JsonType.Arr };
}

function parseObj(rawValue: Record<string, unknown>): JsonVal {
  const value = Object.keys(rawValue).reduce<ObjVal>(function (acc, key) {
    acc[key] = parseVal(rawValue[key]);
    return acc;
  }, {});
  return { value, t: JsonType.Obj };
}

export function parseVal(value: unknown): JsonVal {
  if (value === null) return { value, t: JsonType.Null };
  if (typeof value === "string") return { value, t: JsonType.Str };
  if (typeof value === "number") return { value, t: JsonType.Num };
  if (typeof value === "boolean") return { value, t: JsonType.Bool };
  if (Array.isArray(value)) return parseArr(value);
  return parseObj(value as Record<string, unknown>);
}

// COMPARE FUNCTION

function equalObj(leftObj: ObjVal, rightObj: ObjVal): boolean {
  const leftKeys = Object.keys(leftObj).sort();
  const rightKeys = Object.keys(rightObj).sort();

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.reduce<boolean>(function (_acc, key) {
    return equalVal(leftObj[key], rightObj[key]);
  }, false);
}

function equalArr(leftArr: JsonVal[], rightArr: JsonVal[]) {
  if (leftArr.length !== rightArr.length) return false;
  return leftArr.every(function (leftVal: JsonVal) {
    return rightArr.every(function (rightVal: JsonVal) {
      return equalVal(leftVal, rightVal);
    });
  });
}

export function equalVal(leftVal: JsonVal, rightVal: JsonVal): boolean {
  if (leftVal.t !== rightVal.t) {
    return false;
  }

  if (leftVal.t === JsonType.Obj && rightVal.t === JsonType.Obj) {
    return equalObj(leftVal.value, rightVal.value);
  }

  if (leftVal.t === JsonType.Arr && rightVal.t === JsonType.Arr) {
    return equalArr(leftVal.value, rightVal.value);
  }

  return leftVal.value === rightVal.value;
}
