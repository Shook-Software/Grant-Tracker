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

export const TimePickerInput: React.FC<TimePickerInputProps> = ({
  id,
  value,
  small = false,
  onChange,
  className,
  ...props
}) => {
  const handleChange = (newValue: Dayjs | null) => {
    const localTime = dayjsToLocalTime(newValue);
    if (localTime) {
      onChange(localTime);
    }
  };

  return (
    <div className={cn("time-picker-wrapper", small && "small", className)} {...props}>
      <Picker<Dayjs>
        id={id}
        value={toDayjs(value)}
        onChange={handleChange}
        picker="time"
        format="hh:mm A"
        showSecond={false}
        use12Hours
        minuteStep={15}
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
