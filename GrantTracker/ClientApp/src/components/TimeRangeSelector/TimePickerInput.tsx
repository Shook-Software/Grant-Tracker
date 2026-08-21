import React from 'react';
import Picker from 'rc-picker';
import { LocalTime } from '@js-joda/core';
import { cn } from '@/lib/utils';
import 'rc-picker/assets/index.css';
import './TimePickerInput.css';
import enUS from "rc-picker/lib/locale/en_US";
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';
import dayjs, { Dayjs } from 'dayjs';

interface TimePickerInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  id?: string;
  small?: boolean;
  value: LocalTime;
  onChange: (time: LocalTime) => void;
  minuteStep?: number; // must be a factor of 60
  invalid?: boolean;
}

// rc-picker's minuteStep only limits the panel columns — typed entries commit whatever
// minutes parse, so every value is rounded here before it reaches the caller.
function roundToStep(time: LocalTime, step: number): LocalTime {
  const totalMinutes = time.hour() * 60 + time.minute();
  const rounded = Math.round(totalMinutes / step) * step;
  return LocalTime.MIDNIGHT.plusMinutes(rounded); // plusMinutes wraps 24:00 to 00:00
}

function toDayjs(t: LocalTime | null): Dayjs | null {
  if (!t) return null;
  // anchor to arbitrary date (today) since picker needs a full date-time object
  return dayjs().hour(t.hour()).minute(t.minute()).second(0).millisecond(0);
}

function dayjsToLocalTime(d: Dayjs | null): LocalTime | null {
  if (!d) return null;
  return LocalTime.of(d.hour(), d.minute());
}

// --- Segmented keyboard entry -----------------------------------------------
// rc-picker's masked input mode has the segment ergonomics we want (select a
// cell, first keystroke overwrites, auto-advance), but its mask engine only
// understands 24-hour clock. 
// The rendered text is always fixed-width ("03:15 PM"), so the segments sit at constant
// offsets, and every write below keeps the text valid to rc's parser (and the open panel) tracks each edit live.

const SEGMENTS = [
  { start: 0, end: 2 }, // hh
  { start: 3, end: 5 }, // mm
  { start: 6, end: 8 }, // AM/PM
] as const;

const VALID_REGEX = /^\d{2}:\d{2} [AP]M$/;

// Write through the native value setter and raise `input` so React and
// rc-picker both observe the change exactly as if it were typed.
// Looks like I just recreated the handlers for the home-spun component I used to have
function setNativeValue(input: HTMLInputElement, text: string): void {
  const valueDescriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
  valueDescriptor?.set?.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function useSegmentedTyping(minuteStep: number) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const segmentRef = React.useRef<{ index: number; typed: string }>({ index: 0, typed: '' });
  const mouseDownRef = React.useRef(false);

  const getInput = (): HTMLInputElement | null =>
    wrapperRef.current?.querySelector('input') ?? null;

  const selectSegment = (index: number, typed: string = ''): void => {
    const input = getInput();
    if (!input) return;
    segmentRef.current = { index, typed };
    const { start, end } = SEGMENTS[index];
    input.setSelectionRange(start, end);
    // the controlled input may re-render and collapse the selection; re-apply
    requestAnimationFrame(() => input.setSelectionRange(start, end));
  };

  const replaceSegment = (index: number, text: string): void => {
    const input = getInput();
    if (!input) return;
    const { start, end } = SEGMENTS[index];
    setNativeValue(input, input.value.slice(0, start) + text + input.value.slice(end));
  };

  const advance = (offset: number): void => {
    const { index } = segmentRef.current;
    const input = getInput();
    if (index === 0 && offset > 0 && input?.value.startsWith('00'))
      replaceSegment(0, '12'); // a lone typed "0" is not an hour on a 12-hour clock
    selectSegment(Math.min(Math.max(index + offset, 0), SEGMENTS.length - 1));
  };

  const onKeyDownCapture = (e: React.KeyboardEvent): void => {
    const input = getInput();
    if (!input || e.target !== input) return;
    if (!VALID_REGEX.test(input.value)) return; // unexpected text: fall back to free typing
    const segment = segmentRef.current;

    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      if (segment.index === 0) {
        let typed = segment.typed + e.key;
        if (parseInt(typed, 10) > 12) typed = e.key; // e.g. "1" + "9": 19 is no hour, restart with 9
        replaceSegment(0, typed.padStart(2, '0'));
        if (typed.length === 2 || parseInt(typed, 10) >= 2) advance(1); // no 2-digit hour starts with 2-9
        else selectSegment(0, typed);
      } else if (segment.index === 1) {
        if (!segment.typed && parseInt(e.key, 10) >= 6) {
          replaceSegment(1, '0' + e.key); // 6-9 can only be a final ones digit
          advance(1);
        } else {
          const typed = (segment.typed + e.key).slice(-2);
          replaceSegment(1, typed.padStart(2, '0'));
          if (typed.length === 2) advance(1);
          else selectSegment(1, typed);
        }
      }
      return; // digits do nothing on the AM/PM segment
    }

    if (e.key === ':') {
      e.preventDefault();
      e.stopPropagation();
      if (segment.index === 0) advance(1);
      return;
    }

    if (segment.index === 2 && /^[apAP]$/.test(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      replaceSegment(2, e.key.toLowerCase() === 'a' ? 'AM' : 'PM');
      selectSegment(2);
      return;
    }

    if (e.key === 'Tab') {
      // Tab walks the segments; only the edges leave the field (and let
      // rc-picker's own Tab handling commit the value).
      if (!e.shiftKey && segment.index < SEGMENTS.length - 1) {
        e.preventDefault();
        e.stopPropagation();
        advance(1);
      } else if (e.shiftKey && segment.index > 0) {
        e.preventDefault();
        e.stopPropagation();
        advance(-1);
      }
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      advance(e.key === 'ArrowRight' ? 1 : -1);
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      const direction = e.key === 'ArrowUp' ? 1 : -1;
      const text = input.value;
      if (segment.index === 0) {
        const hour = parseInt(text.slice(0, 2), 10) || 12;
        replaceSegment(0, String(((hour - 1 + direction + 12) % 12) + 1).padStart(2, '0'));
      } else if (segment.index === 1) {
        const minute = parseInt(text.slice(3, 5), 10) || 0;
        replaceSegment(1, String((minute + direction * minuteStep + 60) % 60).padStart(2, '0'));
      } else {
        replaceSegment(2, text.slice(6, 8) === 'AM' ? 'PM' : 'AM');
      }
      selectSegment(segment.index);
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      e.stopPropagation();
      selectSegment(segment.index); // re-arm overwrite; deleting would only corrupt the text
      return;
    }

    // Block any other printable character from corrupting the canonical text.
    // Enter/Escape/etc. have multi-character key names and pass through to rc-picker.
    if (e.key.length === 1) e.preventDefault();
  };

  const onMouseDownCapture = (): void => {
    mouseDownRef.current = true;
  };

  const onMouseUpCapture = (e: React.MouseEvent): void => {
    mouseDownRef.current = false;
    const input = getInput();
    if (!input || e.target !== input || !VALID_REGEX.test(input.value)) return;
    // after the browser places the caret, snap the selection to that segment
    requestAnimationFrame(() => {
      const pos = input.selectionStart ?? 0;
      selectSegment(pos <= SEGMENTS[0].end ? 0 : pos <= SEGMENTS[1].end ? 1 : 2);
    });
  };

  const onFocusCapture = (e: React.FocusEvent): void => {
    const input = getInput();
    if (!input || e.target !== input) return;
    // keyboard focus starts at the hour; mouse focus is handled on mouseup
    if (!mouseDownRef.current && VALID_REGEX.test(input.value))
      requestAnimationFrame(() => selectSegment(0));
  };

  return {
    wrapperRef,
    segmentHandlers: { onKeyDownCapture, onMouseDownCapture, onMouseUpCapture, onFocusCapture },
  };
}

export const TimePickerInput: React.FC<TimePickerInputProps> = ({
  id,
  value,
  small = false,
  onChange,
  minuteStep = 15,
  invalid = false,
  className,
  ...props
}) => {
  const { wrapperRef, segmentHandlers } = useSegmentedTyping(minuteStep);

  const handleChange = (newValue: Dayjs | null) => {
    const localTime = dayjsToLocalTime(newValue);
    if (localTime) {
      onChange(roundToStep(localTime, minuteStep));
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={cn("time-picker-wrapper", small && "small", invalid && "invalid", className)}
      {...props}
      {...segmentHandlers}
    >
      <Picker<Dayjs>
        id={id}
        value={toDayjs(value)}
        onChange={handleChange}
        picker="time"
        format="hh:mm A"
        showSecond={false}
        use12Hours
        minuteStep={minuteStep as any}
        locale={enUS}
        placement="bottomLeft"
        getPopupContainer={(trigger) => trigger.parentElement || document.body}
        dropdownClassName="time-picker-dropdown"
        className={cn(
          "border border-input rounded-md bg-background text-foreground",
          "focus:outline-none focus:ring-1 focus:ring-ring"
        )}
        generateConfig={dayjsGenerateConfig}
      />
    </div>
  );
};
