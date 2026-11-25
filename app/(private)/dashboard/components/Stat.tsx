import clsx from "clsx";

import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";

type Props = {
  stat: {
    name: string;
    data: string;
    previousData: string;
    change: string;
    changeType: string;
  };
};

const Stat = ({ stat }: Props) => {
  return (
    <div key={stat.name} className="rounded-xl bg-white px-4 py-5 sm:p-6">
      <dt className="text-base font-normal text-primary-900">{stat.name}</dt>
      <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
        <div className="flex items-baseline text-2xl font-semibold text-primary-900">
          {stat.data}
          <span className="ml-2 text-sm font-medium text-primary-500">
            from {stat.previousData}
          </span>
        </div>

        <div
          className={clsx(
            stat.changeType === "increase"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800",
            "inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0",
          )}
        >
          {stat.changeType === "increase" ? (
            <ArrowUpIcon
              aria-hidden="true"
              className="-ml-1 mr-0.5 h-4 w-4 flex-shrink-0 self-center text-green-500"
            />
          ) : (
            <ArrowDownIcon
              aria-hidden="true"
              className="-ml-1 mr-0.5 h-4 w-4 flex-shrink-0 self-center text-red-500"
            />
          )}

          <span className="sr-only">
            {" "}
            {stat.changeType === "increase" ? "Increased" : "Decreased"} by{" "}
          </span>
          {stat.change}
        </div>
      </dd>
    </div>
  );
};

export default Stat;
