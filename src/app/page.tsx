"use client";

import React, { ButtonHTMLAttributes, TextareaHTMLAttributes } from "react";
import sample1 from "@/lib/sample1.json";
import sample2 from "@/lib/sample2.json";

import {
  Diff,
  DiffType,
  ObjDiff,
  parseDiff,
} from "@/lib/diff";
import { parseVal, resolveObj, resolveVal } from "@/lib/json";

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

function TextInput({
  error,
  children,
  className,
  ...restProps
}: { error?: Error } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col flex-1">
      <textarea
        className={`resize-none border-2 border-b-0 flex-grow p-4 outline-none whitespace-pre ${
          error ? "border-red-400" : "border-transparent "
        } ${className}`}
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

function ObjMatchesResultView({ diff }: { diff: ObjDiff }) {
  return (
    <div className="flex flex-grow w-full justify-between overflow-hidden">
      <div className="flex flex-1 flex-col px-1">
        <TextInput
          onChange={() => {}}
          value={JSON.stringify(resolveObj(diff.distinctLeft), null, 4)}
        />
        <div className="p-2 bg-gray-200 text-black font-bold">Left only</div>
      </div>
      <div className="flex flex-1 flex-col px-1">
        <TextInput
          onChange={() => {}}
          value={JSON.stringify(resolveObj(diff.match), null, 4)}
        />
        <div className="p-2 bg-gray-200 text-black font-bold">Matches</div>
      </div>
      <div className="flex flex-1 flex-col justify-between px-1">
        <TextInput
          onChange={() => {}}
          value={JSON.stringify(resolveObj(diff.distinctRight), null, 4)}
        />
        <div className="p-2 bg-gray-200 text-black font-bold">Right only</div>
      </div>
    </div>
  );
}

function ObjDiffPerFieldView({
  diff,
  onChangeMode,
}: {
  diff: ObjDiff;
  onChangeMode: () => void;
}) {
  return (
    <div className="flex flex-grow w-full overflow-hidden relative">
      <div className="absolute top-4 right-6">
        <Button onClick={onChangeMode}>Plain Text</Button>
      </div>
      <div className="flex-grow w-full overflow-auto">
        {Object.keys(diff.diff).map((key, i) => {
          return (
            <React.Fragment key={i}>
              <div className="p-2 bg-gray-200 text-black font-bold">
                &quot;{key}&quot;
              </div>
              <div className="flex w-full justify-between">
                <div className="flex flex-1 flex-col border-r overflow-auto">
                  <pre className="bg-gray-50 p-2 whitespace-pre-wrap">
                    {JSON.stringify(resolveVal(diff.diff[key].left), null, 4)}
                  </pre>
                </div>
                <div className="flex flex-1 flex-col border-l overflow-auto">
                  <pre className="bg-gray-50 p-2 whitespace-pre-wrap">
                    {JSON.stringify(resolveVal(diff.diff[key].right), null, 4)}
                  </pre>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ObjDiffPlainView({
  diff,
  onChangeMode,
}: {
  diff: ObjDiff;
  onChangeMode: () => void;
}) {
  return (
    <div className="flex flex-grow w-full overflow-hidden relative">
      <div className="absolute top-4 right-6">
        <Button onClick={onChangeMode}>Per Field</Button>
      </div>
      <div className="flex justify-between flex-grow w-full overflow-hidden">
        <div className="flex flex-col flex-1 mr-1">
          <TextInput
            onChange={() => {}}
            value={JSON.stringify(resolveObj(diff.diffLeft), null, 4)}
            className="flex-grow"
          />
          <div className="p-2 bg-gray-200 text-black font-bold">Left</div>
        </div>
        <div className="flex flex-col flex-1 ml-1">
          <TextInput
            onChange={() => {}}
            value={JSON.stringify(resolveObj(diff.diffRight), null, 4)}
            className="flex-grow"
          />
          <div className="p-2 bg-gray-200 text-black font-bold">Right</div>
        </div>
      </div>
    </div>
  );
}

function Button(
  props: {
    children: React.ReactNode;
  } & ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      className={`px-4 py-1 rounded bg-gray-700 text-white hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed ${props.className}`}
      {...props}
    />
  );
}

function StepButton(props: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button onClick={props.onClick} disabled={props.disabled}>
      {props.children}
    </Button>
  );
}

function ObjResultView({
  diff,
  onBack,
}: {
  diff: ObjDiff;
  onBack: () => void;
}) {
  const [step, setStep] = React.useState(1);
  const [diffViewMode, setDiffViewMode] = React.useState("plain");
  return (
    <>
      <div className="mb-4 flex justify-center gap-2">
        <button
          onClick={onBack}
          className="font-bold px-8 py-1 rounded text-black hover:underline"
        >
          Back
        </button>
        <StepButton
          onClick={() => {
            setStep(1);
          }}
          disabled={step === 1}
        >
          Matches
        </StepButton>
        <StepButton
          onClick={() => {
            setStep(2);
          }}
          disabled={step === 2}
        >
          Diff
        </StepButton>
      </div>
      {step === 1 && <ObjMatchesResultView diff={diff} />}
      {step === 2 && diffViewMode === "per_field" && (
        <ObjDiffPerFieldView
          diff={diff}
          onChangeMode={() => setDiffViewMode("plain")}
        />
      )}
      {step === 2 && diffViewMode === "plain" && (
        <ObjDiffPlainView
          diff={diff}
          onChangeMode={() => setDiffViewMode("per_field")}
        />
      )}
    </>
  );
}

function ResultView({ diff, onBack }: { diff: Diff; onBack: () => void }) {
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
            <ResultView key={i} diff={d} onBack={onBack} />
          ))}
        </div>
      );
    case DiffType.Obj:
      return <ObjResultView diff={diff} onBack={onBack} />;

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

  const clear = () => {
    if (window.confirm("You sure?")) {
      setTextLeft("");
      setTextRight("");
      setErrorLeft(undefined);
      setErrorRight(undefined);
    }
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
    <div className="flex h-screen overflow-hidden flex-col items-center justify-between p-16">
      <header className="mb-8">
        <h1 className="font-black text-5xl">{"{JSON}Diff"}</h1>
      </header>
      <main className="flex flex-col w-full flex-grow overflow-hidden">
        {/* <div className="flex flex-col flex-grow w-full"> */}
        {diffResult ? (
          <ResultView
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
              {!textLeft && !textRight ? (
                <button
                  className="mt-4 font-bold underline"
                  onClick={fillSample}
                >
                  Sample
                </button>
              ) : (
                <button className="mt-4 font-bold underline" onClick={clear}>
                  Clear
                </button>
              )}
              <a
                className="block mt-4 font-bold underline text-center"
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
    </div>
  );
}
