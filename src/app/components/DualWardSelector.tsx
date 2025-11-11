// src/app/components/DualWardSelector.tsx
'use client';

import { useState, Fragment, useEffect } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

type Ward = {
  id: string;
  name: string;
  mergedFrom: string[];
};

type OldWard = {
  id: string;
  name: string;
  splitInto: string[];
};

type DistrictWithWards = {
  id: string;
  name: string;
  wards: Ward[];
  oldWards: OldWard[];
};

type WardOption = {
  id: string;
  name: string;
  districtName: string;
};

interface DualWardSelectorProps {
  districts: DistrictWithWards[];
  defaultOldWard?: WardOption | null;
  defaultWard?: WardOption | null;
}

export default function DualWardSelector({ districts, defaultOldWard, defaultWard }: DualWardSelectorProps) {
  // Tạo danh sách tất cả oldWards và wards
  const allOldWards: WardOption[] = districts.flatMap(district =>
    district.oldWards.map(oldWard => ({
      id: oldWard.id,
      name: `${oldWard.name}, ${district.name}`,
      districtName: district.name,
    }))
  );

  const allWards: WardOption[] = districts.flatMap(district =>
    district.wards.map(ward => ({
      id: ward.id,
      name: `${ward.name}, ${district.name}`,
      districtName: district.name,
    }))
  );

  // State cho 2 combobox
  const [selectedOldWard, setSelectedOldWard] = useState<WardOption | null>(defaultOldWard || null);
  const [selectedWard, setSelectedWard] = useState<WardOption | null>(defaultWard || null);
  const [queryOldWard, setQueryOldWard] = useState('');
  const [queryWard, setQueryWard] = useState('');

  // Tạo map để tra cứu nhanh
  const oldWardMap = new Map<string, OldWard & { districtName: string }>();
  const wardMap = new Map<string, Ward & { districtName: string }>();

  districts.forEach(district => {
    district.oldWards.forEach(oldWard => {
      oldWardMap.set(oldWard.id, { ...oldWard, districtName: district.name });
    });
    district.wards.forEach(ward => {
      wardMap.set(ward.id, { ...ward, districtName: district.name });
    });
  });

  // Filter wards dựa trên selectedOldWard
  const getFilteredWards = (): WardOption[] => {
    if (!selectedOldWard) {
      return allWards;
    }
    
    const oldWardData = oldWardMap.get(selectedOldWard.id);
    if (!oldWardData || oldWardData.splitInto.length === 0) {
      return allWards;
    }

    // Chỉ hiển thị các wards có trong splitInto của oldWard đã chọn
    return allWards.filter(ward => oldWardData.splitInto.includes(ward.id));
  };

  // Filter oldWards dựa trên selectedWard
  const getFilteredOldWards = (): WardOption[] => {
    if (!selectedWard) {
      return allOldWards;
    }
    
    const wardData = wardMap.get(selectedWard.id);
    if (!wardData || wardData.mergedFrom.length === 0) {
      return allOldWards;
    }

    // Chỉ hiển thị các oldWards có trong mergedFrom của ward đã chọn
    return allOldWards.filter(oldWard => wardData.mergedFrom.includes(oldWard.id));
  };

  // Khi chọn oldWard, tự động filter và suggest wards
  useEffect(() => {
    if (selectedOldWard) {
      const oldWardData = oldWardMap.get(selectedOldWard.id);
      if (oldWardData && oldWardData.splitInto.length > 0) {
        const filteredWards = allWards.filter(ward => oldWardData.splitInto.includes(ward.id));
        // Nếu có đúng 1 ward trong splitInto, tự động chọn
        if (filteredWards.length === 1 && !selectedWard) {
          setSelectedWard(filteredWards[0]);
        }
        // Nếu selectedWard hiện tại không nằm trong splitInto, clear nó
        else if (selectedWard && !filteredWards.find(w => w.id === selectedWard.id)) {
          setSelectedWard(null);
        }
      }
      // Không clear ward nếu oldWard không có splitInto - để user tự chọn
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOldWard]);

  // Khi chọn ward, tự động filter và suggest oldWards
  useEffect(() => {
    if (selectedWard) {
      const wardData = wardMap.get(selectedWard.id);
      if (wardData && wardData.mergedFrom.length > 0) {
        const filteredOldWards = allOldWards.filter(oldWard => wardData.mergedFrom.includes(oldWard.id));
        // Nếu có đúng 1 oldWard trong mergedFrom, tự động chọn
        if (filteredOldWards.length === 1 && !selectedOldWard) {
          setSelectedOldWard(filteredOldWards[0]);
        }
        // Nếu selectedOldWard hiện tại không nằm trong mergedFrom, clear nó
        else if (selectedOldWard && !filteredOldWards.find(ow => ow.id === selectedOldWard.id)) {
          setSelectedOldWard(null);
        }
      }
      // Không clear oldWard nếu ward không có mergedFrom - để user tự chọn
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWard]);

  const filteredOldWards = queryOldWard === ''
    ? getFilteredOldWards()
    : getFilteredOldWards().filter((oldWard) =>
        oldWard.name.toLowerCase().replace(/\s+/g, '').includes(queryOldWard.toLowerCase().replace(/\s+/g, ''))
      );

  const filteredWards = queryWard === ''
    ? getFilteredWards()
    : getFilteredWards().filter((ward) =>
        ward.name.toLowerCase().replace(/\s+/g, '').includes(queryWard.toLowerCase().replace(/\s+/g, ''))
      );

  return (
    <div className="space-y-4">
      {/* OldWard Combobox */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ cũ (OldWard)
        </label>
        <Combobox value={selectedOldWard} onChange={setSelectedOldWard}>
          <div className="relative mt-1">
            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
              <Combobox.Input
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                displayValue={(oldWard: WardOption) => oldWard?.name || ''}
                onChange={(event) => setQueryOldWard(event.target.value)}
                placeholder="Chọn hoặc nhập để tìm Phường/Xã cũ..."
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </Combobox.Button>
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQueryOldWard('')}
            >
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                {filteredOldWards.length === 0 && queryOldWard !== '' ? (
                  <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                    Không tìm thấy.
                  </div>
                ) : (
                  filteredOldWards.map((oldWard) => (
                    <Combobox.Option
                      key={oldWard.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-600 text-white' : 'text-gray-900'
                        }`
                      }
                      value={oldWard}
                    >
                      {({ selected, active }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {oldWard.name}
                          </span>
                          {selected ? (
                            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-blue-600'}`}>
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
        {/* Hidden inputs for OldWard */}
        <input type="hidden" name="oldWardId" value={selectedOldWard?.id || ''} />
        <input type="hidden" name="oldWardName" value={selectedOldWard?.name?.split(',')[0]?.trim() || ''} />
        <input type="hidden" name="oldWardDistrictName" value={selectedOldWard?.districtName || ''} />
      </div>

      {/* Ward Combobox */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ mới (Ward)
        </label>
        <Combobox value={selectedWard} onChange={setSelectedWard}>
          <div className="relative mt-1">
            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
              <Combobox.Input
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                displayValue={(ward: WardOption) => ward?.name || ''}
                onChange={(event) => setQueryWard(event.target.value)}
                placeholder="Chọn hoặc nhập để tìm Phường/Xã mới..."
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </Combobox.Button>
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQueryWard('')}
            >
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                {filteredWards.length === 0 && queryWard !== '' ? (
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
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {ward.name}
                          </span>
                          {selected ? (
                            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-blue-600'}`}>
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
        {/* Hidden inputs for Ward */}
        <input type="hidden" name="wardId" value={selectedWard?.id || ''} />
        <input type="hidden" name="wardName" value={selectedWard?.name?.split(',')[0]?.trim() || ''} />
        <input type="hidden" name="wardDistrictName" value={selectedWard?.districtName || ''} />
      </div>

      {/* Info message */}
      {(selectedOldWard || selectedWard) && (
        <div className="text-sm text-gray-500 mt-2">
          {selectedOldWard && selectedWard && (
            <p>✓ Đã chọn cả địa chỉ cũ và mới</p>
          )}
          {selectedOldWard && !selectedWard && (
            <p>ℹ Đang hiển thị các Phường/Xã mới liên quan đến địa chỉ cũ đã chọn</p>
          )}
          {!selectedOldWard && selectedWard && (
            <p>ℹ Đang hiển thị các Phường/Xã cũ liên quan đến địa chỉ mới đã chọn</p>
          )}
        </div>
      )}
    </div>
  );
}

