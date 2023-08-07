"use client";

import React from "react";
import sample1 from "@/lib/sample1.json";
import sample2 from "@/lib/sample2.json";

import { TextareaHTMLAttributes } from "react";
import { Diff, DiffType, parseDiff } from "@/lib/diff";
import { parseVal, resolveObj } from "@/lib/json";

function TextInput({
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
      {error ? (
        <div className={`w-full h-8 ${error ? "bg-black" : "bg-white"} p-2`}>
          <span className="text-red-400">{error.message}</span>
        </div>
      ) : null}
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

function DiffResultView({ diff, onBack }: { diff: Diff; onBack: () => void }) {
  switch (diff.t) {
    case DiffType.Match:
      return <div>Matches</div>;
    case DiffType.Primitive:
      return (
        <div>
          <div>left</div>
          <div>right</div>
        </div>
      );
    case DiffType.Arr:
      return (
        <div>
          {diff.diff.map((d, i) => (
            <DiffResultView key={i} diff={d} onBack={onBack} />
          ))}
        </div>
      );
    case DiffType.Obj:
      return (
        <>
          <div className="mb-4">
            <button
              onClick={onBack}
              className="px-8 py-1 rounded bg-gray-700 text-white hover:bg-gray-900"
            >
              Back
            </button>
          </div>
          <div className="flex flex-grow w-full justify-between">
            <div className="flex flex-1 flex-col px-1">
              <TextInput
                onChange={() => {}}
                value={JSON.stringify(resolveObj(diff.distinctLeft), null, 4)}
              />
              <div className="p-2 bg-gray-200 text-black font-bold">Left</div>
            </div>
            <div className="flex flex-1 flex-col px-1">
              <TextInput
                onChange={() => {}}
                value={JSON.stringify(resolveObj(diff.match), null, 4)}
              />
              <div className="p-2 bg-gray-200 text-black font-bold">
                Matches
              </div>
            </div>
            <div className="flex flex-1 flex-col px-1">
              <TextInput
                onChange={() => {}}
                value={JSON.stringify(resolveObj(diff.distinctRight), null, 4)}
              />
              <div className="p-2 bg-gray-200 text-black font-bold">Right</div>
            </div>
          </div>
        </>
      );

    default:
      return <div>Unknown result</div>;
  }
}

export default function Home() {
  const [errorLeft, setErrorLeft] = React.useState<Error>();
  const [errorRight, setErrorRight] = React.useState<Error>();

  const [textLeft, setTextLeft] = React.useState("");
  const [textRight, setTextRight] = React.useState("");

  const [diffResult, setDiffResult] = React.useState<Diff>();

  const fillSample = () => {
    setTextLeft(JSON.stringify(sample1, null, 4));
    setTextRight(JSON.stringify(sample2, null, 4));
    setErrorLeft(undefined);
    setErrorRight(undefined);
  };

  const handleCompare = () => {
    try {
      const left = parseVal(JSON.parse(textLeft));
      const right = parseVal(JSON.parse(textRight));
      const result = parseDiff(left, right);
      console.log(result);
      setDiffResult(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-16">
      <div className="mb-8">
        <h1 className="font-black text-5xl">{"{JSON}Diff"}</h1>
      </div>
      {diffResult ? (
        <DiffResultView
          diff={diffResult}
          onBack={() => {
            setDiffResult(undefined);
          }}
        />
      ) : (
        <div className="flex flex-grow w-full justify-between">
          <TextInput
            error={errorLeft}
            placeholder="Enter json here..."
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

          <div className="mx-4 flex flex-col">
            <button
              disabled={
                !!errorLeft || !!errorRight || (!textLeft && !textRight)
              }
              onClick={handleCompare}
              className="px-4 py-1 rounded bg-gray-700 text-white hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Compare
            </button>
            {!textLeft && !textRight && (
              <button className="mt-4 font-bold underline" onClick={fillSample}>
                Sample
              </button>
            )}
            <a
              className="block mt-10 font-bold underline text-center"
              href="https://github.com/pirey/jsondiff"
              target="_blank"
              rel="noreferrer noopener"
            >
              Github
            </a>
          </div>

          <TextInput
            error={errorRight}
            placeholder="Enter json here..."
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
      )}
    </main>
  );
}
