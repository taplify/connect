"use client";

import clsx from "clsx";
import { useLayoutEffect, useRef, useState } from "react";

type Connection = {
  name: string;
  email: string;
  phoneNumber: string;
  source: string;
  dateConnected: Date;
};

const connections: Connection[] = [
  {
    name: "Yap Yee Qiang",
    email: "yapyeeqiang@gmail.com",
    phoneNumber: "+60 19-824 8014",
    source: "Instagram",
    dateConnected: new Date(),
  },
  {
    name: "Yap Yee Qiang",
    email: "yapyeeqiang@gmail.com",
    phoneNumber: "+60 19-824 8014",
    source: "Instagram",
    dateConnected: new Date(),
  },
  {
    name: "Yap Yee Qiang",
    email: "yapyeeqiang@gmail.com",
    phoneNumber: "+60 19-824 8014",
    source: "Instagram",
    dateConnected: new Date(),
  },
  {
    name: "Yap Yee Qiang",
    email: "yapyeeqiang@gmail.com",
    phoneNumber: "+60 19-824 8014",
    source: "Instagram",
    dateConnected: new Date(),
  },
  {
    name: "Yap Yee Qiang",
    email: "yapyeeqiang@gmail.com",
    phoneNumber: "+60 19-824 8014",
    source: "Instagram",
    dateConnected: new Date(),
  },
  {
    name: "Yap Yee Qiang",
    email: "yapyeeqiang@gmail.com",
    phoneNumber: "+60 19-824 8014",
    source: "Instagram",
    dateConnected: new Date(),
  },
];

const Table = () => {
  const checkbox = useRef<HTMLInputElement | null>(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection[]>(
    [],
  );

  useLayoutEffect(() => {
    const isIndeterminate =
      selectedConnection.length > 0 &&
      selectedConnection.length < connections.length;
    setChecked(selectedConnection.length === connections.length);
    setIndeterminate(isIndeterminate);

    if (checkbox.current) {
      checkbox.current.indeterminate = isIndeterminate;
    }
  }, [selectedConnection]);

  function toggleAll() {
    setSelectedConnection(checked || indeterminate ? [] : connections);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  return (
    <div className="flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="relative">
            {selectedConnection.length > 0 && (
              <div className="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
                <button
                  type="button"
                  className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                >
                  Bulk edit
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                >
                  Delete all
                </button>
              </div>
            )}
            <table className="min-w-full table-fixed divide-y divide-gray-300 overflow-hidden rounded-xl">
              <thead className="bg-primary-800">
                <tr>
                  <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      ref={checkbox}
                      checked={checked}
                      onChange={toggleAll}
                    />
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pr-3 text-left text-sm font-semibold text-primary-50"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-primary-50"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-primary-50"
                  >
                    Phone Number
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-primary-50"
                  >
                    Source
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {connections.map((person) => (
                  <tr
                    key={person.email}
                    className={
                      selectedConnection.includes(person)
                        ? "bg-gray-50"
                        : undefined
                    }
                  >
                    <td className="relative px-7 sm:w-12 sm:px-6">
                      {selectedConnection.includes(person) && (
                        <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />
                      )}
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        value={person.email}
                        checked={selectedConnection.includes(person)}
                        onChange={(e) =>
                          setSelectedConnection(
                            e.target.checked
                              ? [...selectedConnection, person]
                              : selectedConnection.filter((p) => p !== person),
                          )
                        }
                      />
                    </td>
                    <td
                      className={clsx(
                        "whitespace-nowrap py-4 pr-3 text-sm font-medium",
                        selectedConnection.includes(person)
                          ? "text-indigo-600"
                          : "text-gray-900",
                      )}
                    >
                      {person.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {person.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {person.phoneNumber}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {person.source}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                      <a
                        href="#"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit<span className="sr-only">, {person.name}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
