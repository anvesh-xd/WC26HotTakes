"use client";

import { memo } from "react";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
}

function NameInput({ value, onChange }: NameInputProps) {
  return (
    <div className="float-field">
      <input
        id="name"
        type="text"
        value={value}
        placeholder=" "
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
      />
      <label htmlFor="name">Enter your name to get started</label>
    </div>
  );
}

export default memo(NameInput);
