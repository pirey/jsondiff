import { JsonType, JsonVal, ObjVal, equalVal, isPrimitiveType } from "./json";

function uniqStr(a: string[], b: string[]) {
  return Array.from(new Set([...a, ...b]));
}

export enum DiffType {
  Match,
  Primitive,
  Obj,
  Arr,
}

export type Diff = Match | PrimitiveDiff | ArrDiff | ObjDiff;

type Match = {
  t: DiffType.Match;
  match: JsonVal;
};

type PrimitiveDiff = {
  t: DiffType.Primitive;
  diff: {
    left: JsonVal;
    right: JsonVal;
  };
};

type ArrDiff = {
  t: DiffType.Arr;
  diff: Diff[];
};

export type ObjDiff = {
  t: DiffType.Obj;
  // TODO: find out any matched children even though parent diff
  diff: Record<
    string,
    {
      left: JsonVal;
      right: JsonVal;
    }
  >;
  match: ObjVal;
  diffLeft: ObjVal;
  diffRight: ObjVal;
  distinctLeft: ObjVal;
  distinctRight: ObjVal;
};

function parseDiffObj(left: ObjVal, right: ObjVal): Diff {
  const allKeys = uniqStr(Object.keys(left), Object.keys(right));

  const result = allKeys.reduce<ObjDiff>(
    function (acc, currentKey) {
      if (!left[currentKey]) {
        return {
          ...acc,
          distinctRight: {
            ...acc.distinctRight,
            [currentKey]: right[currentKey],
          },
        };
      }

      if (!right[currentKey]) {
        return {
          ...acc,
          distinctLeft: {
            ...acc.distinctLeft,
            [currentKey]: left[currentKey],
          },
        };
      }

      if (equalVal(left[currentKey], right[currentKey])) {
        return {
          ...acc,
          match: {
            ...acc.match,
            [currentKey]: left[currentKey],
          },
        };
      }

      return {
        ...acc,
        diffLeft: {
          ...acc.diffLeft,
          [currentKey]: left[currentKey]
        },
        diffRight: {
          ...acc.diffRight,
          [currentKey]: left[currentKey]
        },
        diff: {
          ...acc.diff,
          [currentKey]: {
            left: left[currentKey],
            right: right[currentKey],
          },
        },
      };
    },
    {
      t: DiffType.Obj,
      diff: {},
      match: {},
      diffLeft: {},
      diffRight: {},
      distinctRight: {},
      distinctLeft: {},
    }
  );

  return result;
}

function parseDiffPrimitive(left: JsonVal, right: JsonVal): Diff {
  return equalVal(left, right)
    ? {
        t: DiffType.Match,
        match: left,
      }
    : {
        t: DiffType.Primitive,
        diff: { left, right },
      };
}

// TODO: still messed up
function parseDiffArr(left: JsonVal[], right: JsonVal[]): Diff {
  return {
    t: DiffType.Arr,
    // TODO: currently just compare per index
    diff: left.map(function (leftVal: JsonVal, i) {
      return parseDiff(leftVal, right[i]);
    }),
  };
}

export function parseDiff(left: JsonVal, right: JsonVal): Diff {
  if (left.t !== right.t) {
    return {
      t: DiffType.Primitive,
      diff: {
        left,
        right,
      },
    } as PrimitiveDiff;
  }

  if (isPrimitiveType(left) && isPrimitiveType(right)) {
    return parseDiffPrimitive(left, right);
  }

  if (left.t === JsonType.Obj && right.t === JsonType.Obj) {
    return parseDiffObj(left.value, right.value);
  }

  if (left.t === JsonType.Arr && right.t === JsonType.Arr) {
    return parseDiffArr(left.value, right.value);
  }

  // TODO: handle possible missing case
  return {
    t: DiffType.Primitive,
    diff: {
      left,
      right,
    },
  } as PrimitiveDiff;
}
