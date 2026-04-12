"use client";

export type OptionState =
  | "default"
  | "selected"
  | "correct"
  | "wrong"
  | "dimmed";

interface OptionButtonProps {
  optionKey: string;
  text: string;
  state: OptionState;
  disabled: boolean;
  onSelect: (key: string) => void;
}

const stateStyles: Record<OptionState, string> = {
  default: "border-gray-200 bg-white text-gray-900 active:scale-[0.98]",
  selected: "border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500",
  correct: "border-green-500 bg-green-50 text-green-900 ring-2 ring-green-500",
  wrong: "border-red-500 bg-red-50 text-red-900 ring-2 ring-red-500",
  dimmed: "border-gray-200 bg-gray-50 text-gray-400",
};

export function OptionButton({
  optionKey,
  text,
  state,
  disabled,
  onSelect,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(optionKey)}
      className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${stateStyles[state]} ${disabled ? "cursor-default" : "cursor-pointer"}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
          state === "selected"
            ? "bg-blue-500 text-white"
            : state === "correct"
              ? "bg-green-500 text-white"
              : state === "wrong"
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-600"
        }`}
      >
        {optionKey}
      </span>
      <span className="text-base leading-snug">{text}</span>
    </button>
  );
}
