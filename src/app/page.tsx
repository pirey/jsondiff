"use client";

import React from "react";
import sample1 from "@/lib/sample1.json";
import sample2 from "@/lib/sample2.json";

import { TextareaHTMLAttributes } from "react";
import { diff } from "@/lib/diff";
import { parseVal } from "@/lib/json";

export function TextInput({
  error,
  children,
  ...restProps
}: { error?: Error } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col flex-1">
      <textarea
        className={`resize-none border-2 border-b-0 flex-grow p-4 outline-none ${
          error ? "border-red-400" : "border-transparent "
        }`}
        {...restProps}
      >
        {children}
      </textarea>
      <div
        className={`w-full h-8 ${error ? "bg-black" : "bg-white"} p-2`}
      >
        {error ? <span className="text-red-400">{error.message}</span> : null}
      </div>
    </div>
  );
}

function formatJsonString(str: string) {
  try {
    const obj = JSON.parse(str);
    const formatted = JSON.stringify(obj, null, 4);
    return formatted;
  } catch (error) {
    console.error((error as Error).message);
    throw error;
  }
}

export default function Home() {
  const [errorLeft, setErrorLeft] = React.useState<Error>();
  const [errorRight, setErrorRight] = React.useState<Error>();

  const [textLeft, setTextLeft] = React.useState(
    JSON.stringify(sample1, null, 4)
  );
  const [textRight, setTextRight] = React.useState(
    JSON.stringify(sample2, null, 4)
  );

  const handleCompare = () => {
    try {
      const left = parseVal(JSON.parse(textLeft));
      const right = parseVal(JSON.parse(textRight));
      const result = diff(left, right);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-grow w-full justify-between">
        <TextInput
          error={errorLeft}
          onBlur={(e) => {
            try {
              setTextLeft(formatJsonString(e.target.value));
              setErrorLeft(undefined);
            } catch (error) {
              setErrorLeft(error as Error);
            }
          }}
          onChange={(e) => {
            setTextLeft(e.target.value);
          }}
          value={textLeft}
        />

        <div className="mx-4">
          <button
            onClick={handleCompare}
            className="px-4 py-2 rounded bg-blue-400 text-white hover:bg-blue-500"
          >
            Compare
          </button>
        </div>

        <TextInput
          error={errorRight}
          onBlur={(e) => {
            try {
              setTextRight(formatJsonString(e.target.value));
              setErrorRight(undefined);
            } catch (error) {
              setErrorRight(error as Error);
            }
          }}
          onChange={(e) => {
            setTextRight(e.target.value);
          }}
          value={textRight}
        />
      </div>
    </main>
  );
}
