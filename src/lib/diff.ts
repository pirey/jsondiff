import { JsonType, JsonVal, ObjVal, equalVal, isPrimitiveType } from "./json";

function uniqStr(a: string[], b: string[]) {
  return Array.from(new Set([...a, ...b]));
}

enum DiffType {
  Match,
  Primitive,
  Obj,
  Arr,
}

type Diff = Match | PrimitiveDiff | ArrDiff | ObjDiff;

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

type ObjDiff = {
  t: DiffType.Obj;
  // TODO: find out any matched children even though parent diff
  diff: Record<
    string,
    {
      left: JsonVal;
      right: JsonVal;
    }
  >;
  match: Record<string, JsonVal>;
  distinctLeft: ObjVal
  distinctRight: ObjVal
};

function diffObj(left: ObjVal, right: ObjVal): Diff {
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
      distinctRight: {},
      distinctLeft: {},
    }
  );

  return result
}

function diffPrimitive(left: JsonVal, right: JsonVal): Diff {
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
function diffArr(left: JsonVal[], right: JsonVal[]): Diff {
  return {
    t: DiffType.Arr,
    // TODO: currently just compare per index
    diff: left.map(function (leftVal: JsonVal, i) {
      return diff(leftVal, right[i]);
    }),
  };
}

export function diff(left: JsonVal, right: JsonVal): Diff {
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
    return diffPrimitive(left, right);
  }

  if (left.t === JsonType.Obj && right.t === JsonType.Obj) {
    return diffObj(left.value, right.value);
  }

  if (left.t === JsonType.Arr && right.t === JsonType.Arr) {
    return diffArr(left.value, right.value);
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
