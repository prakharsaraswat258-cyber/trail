'use client';

import React, { useState } from 'react';
import { CAMPUS_BUILDINGS } from '../../../lib/constants/campusBuildings';
import { BentoCard } from '../../ui/BentoCard';
import { Input } from '../../ui/Input';

interface DateLocationStepProps {
  formData: {
    dateLost: string;
    timeLost?: string;
    timePeriod?: 'morning' | 'afternoon' | 'evening' | 'night';
    isTimeExact: boolean;
    building: string;
    area?: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
  headingRef: React.RefObject<HTMLHeadingElement>;
}

export default function DateLocationStep({
  formData,
  errors,
  onChange,
  headingRef,
}: DateLocationStepProps) {
  const today = new Date().toISOString().split('T')[0];
  const [buildingSearch, setBuildingSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredBuildings = CAMPUS_BUILDINGS.filter((b) =>
    b.name.toLowerCase().includes(buildingSearch.toLowerCase()) ||
    b.code.toLowerCase().includes(buildingSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 bg-surface p-6 rounded-lg border">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-text-primary tracking-tight outline-none"
        >
          Step 3: Date, Time & Last Known Location
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Specify when and where the item was last seen to narrow down matching records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: When */}
        <BentoCard className="p-6 space-y-5">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-bold text-text-primary">When</h3>
            <p className="text-xs text-text-secondary">
              Date and approximate time you last had the item
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="lost-date"
                className="text-sm font-semibold text-text-secondary select-none"
              >
                Date Lost *
              </label>
              <input
                id="lost-date"
                type="date"
                max={today}
                value={formData.dateLost}
                onChange={(e) => onChange('dateLost', e.target.value)}
                className={`w-full min-h-[44px] px-4 py-2.5 text-sm text-text-primary bg-surface border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                  errors.dateLost
                    ? 'border-error focus:border-error focus:ring-error/15'
                    : 'border-border-strong focus:border-accent focus:ring-accent/15'
                }`}
              />
              {errors.dateLost && (
                <p className="text-[13px] text-error mt-0.5">{errors.dateLost}</p>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-secondary">
                  Approximate Time
                </label>
                <button
                  type="button"
                  onClick={() => onChange('isTimeExact', !formData.isTimeExact)}
                  className="text-xs font-semibold text-accent hover:text-accent-hover underline cursor-pointer"
                >
                  {formData.isTimeExact
                    ? 'Not sure exactly? Pick period'
                    : 'Enter exact time'}
                </button>
              </div>

              {formData.isTimeExact ? (
                <input
                  type="time"
                  value={formData.timeLost || ''}
                  onChange={(e) => onChange('timeLost', e.target.value)}
                  className="w-full min-h-[44px] px-4 py-2.5 text-sm text-text-primary bg-surface border border-border-strong rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                />
              ) : (
                <select
                  value={formData.timePeriod || 'morning'}
                  onChange={(e) => onChange('timePeriod', e.target.value)}
                  className="w-full min-h-[44px] px-4 py-2.5 text-sm text-text-primary bg-surface border border-border-strong rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 cursor-pointer"
                >
                  <option value="morning">Morning (6 AM – 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM – 5 PM)</option>
                  <option value="evening">Evening (5 PM – 9 PM)</option>
                  <option value="night">Night (9 PM – 6 AM)</option>
                </select>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Card 2: Where — Last Known Location */}
        <BentoCard className="p-6 space-y-5">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-bold text-text-primary">
              Where — Last Known Location
            </h3>
            <p className="text-xs text-text-secondary">
              Campus building and specific zone or room
            </p>
          </div>

          <div className="space-y-4">
            {/* Searchable Select for Campus Building */}
            <div className="flex flex-col gap-1.5 relative">
              <label
                htmlFor="lost-building-select"
                className="text-sm font-semibold text-text-secondary select-none"
              >
                Building *
              </label>

              <div className="relative">
                <select
                  id="lost-building-select"
                  value={formData.building}
                  onChange={(e) => {
                    onChange('building', e.target.value);
                    setBuildingSearch('');
                  }}
                  className={`w-full min-h-[44px] px-4 py-2.5 text-sm text-text-primary bg-surface border rounded-lg transition-colors focus:outline-none focus:ring-2 cursor-pointer ${
                    errors.building
                      ? 'border-error focus:border-error focus:ring-error/15'
                      : 'border-border-strong focus:border-accent focus:ring-accent/15'
                  }`}
                >
                  <option value="" disabled>
                    Select a campus building…
                  </option>
                  {CAMPUS_BUILDINGS.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {errors.building && (
                <p className="text-[13px] text-error mt-0.5">{errors.building}</p>
              )}
            </div>

            <Input
              id="lost-area"
              label="Room / Court / Field / Area"
              placeholder="e.g. Room 204, Basketball court, Cafeteria seating area"
              value={formData.area || ''}
              onChange={(e) => onChange('area', e.target.value)}
              helperText="Optional specific room, court, or floor"
            />
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
