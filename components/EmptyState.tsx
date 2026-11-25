type Props = {
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
  description: string;
  onClick: () => void;
};

const EmptyState = ({ icon: Icon, description, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <span className="mt-2 block text-sm font-semibold text-gray-900">
        {description}
      </span>
    </button>
  );
};

export default EmptyState;
