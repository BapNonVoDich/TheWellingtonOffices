// src/app/components/WardCombobox.tsx
'use client';

import { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'; // Cần cài đặt @heroicons/react

// Định nghĩa kiểu dữ liệu cho props
type DistrictWithWards = {
  id: string;
  name: string;
  wards: { id: string; name: string }[];
  oldWards?: { id: string; name: string }[];
}

type WardOption = {
  id: string;
  name: string;
  districtName: string;
  isOldWard?: boolean;
}

interface WardComboboxProps {
  districts: DistrictWithWards[];
  defaultValue?: WardOption | null;
  includeOldWards?: boolean;
  label?: string;
}

export default function WardCombobox({ districts, defaultValue, includeOldWards = false, label }: WardComboboxProps) {
  // Chuyển đổi dữ liệu lồng nhau thành một danh sách phẳng để dễ tìm kiếm
  const allWards: WardOption[] = districts.flatMap(district => {
    const newWards = district.wards.map(ward => ({
      id: ward.id,
      name: `${ward.name}, ${district.name} (Địa chỉ mới)`,
      districtName: district.name,
      isOldWard: false
    }));
    
    const oldWards = includeOldWards && district.oldWards 
      ? district.oldWards.map(oldWard => ({
          id: oldWard.id,
          name: `${oldWard.name}, ${district.name} (Địa chỉ cũ)`,
          districtName: district.name,
          isOldWard: true
        }))
      : [];
    
    return [...newWards, ...oldWards];
  });

  const [selected, setSelected] = useState<WardOption | null>(defaultValue || null);
  const [query, setQuery] = useState('');

  const filteredWards =
    query === ''
      ? allWards
      : allWards.filter((ward) =>
          ward.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <Combobox value={selected} onChange={setSelected}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={(ward: WardOption) => ward?.name || ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nhập để tìm Phường/Xã..."
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {filteredWards.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Không tìm thấy.
                </div>
              ) : (
                filteredWards.map((ward) => (
                  <Combobox.Option
                    key={ward.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={ward}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {ward.name}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-blue-600'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      {/* Các input ẩn này sẽ gửi dữ liệu đến Server Action */}
      <input type="hidden" name="wardName" value={selected?.name?.split(',')[0]?.trim() || ''} />
      <input type="hidden" name="districtName" value={selected?.districtName || ''} />
      <input type="hidden" name="isOldWard" value={selected?.isOldWard ? 'true' : 'false'} />
    </div>
  );
}