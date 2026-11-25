import clsx from "clsx";

type Props = {
  action: {
    id: string;
    title: string;
    description: string;
    icon: React.ForwardRefExoticComponent<
      Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
        title?: string;
        titleId?: string;
      } & React.RefAttributes<SVGSVGElement>
    >;
    isPrimary: boolean;
  };
};

const QuickAction = ({ action }: Props) => {
  return (
    <button
      className={clsx(
        action.isPrimary
          ? "bg-accent-500 hover:bg-accent-700"
          : "bg-primary-800 hover:bg-primary-900",
        "flex flex-row-reverse items-center justify-end gap-4 rounded-2xl p-6 text-left text-primary-50 transition-all duration-200 md:flex-col md:justify-between md:p-8",
      )}
    >
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold sm:text-base md:text-xl">
          {action.title}
        </h3>
        <p className="hidden sm:block">{action.description}</p>
      </div>

      <div className="md:ml-auto">
        <action.icon className="h-6 w-6" />
      </div>
    </button>
  );
};

export default QuickAction;
