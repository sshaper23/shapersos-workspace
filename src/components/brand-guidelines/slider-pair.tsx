"use client";

interface SliderPairProps {
  name: string;
  label: string;
  poles: [string, string];
  value: number;
  onChange: (value: number) => void;
}

export function SliderPair({
  name,
  label,
  poles,
  value,
  onChange,
}: SliderPairProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">{label}</label>
      <div className="space-y-2">
        <input
          id={name}
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-[hsl(0_0%_100%/0.08)] rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0ea5e9] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#0ea5e9] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground max-w-[45%]">
            {poles[0]}
          </span>
          <span className="text-xs text-muted-foreground max-w-[45%] text-right">
            {poles[1]}
          </span>
        </div>
      </div>
    </div>
  );
}
