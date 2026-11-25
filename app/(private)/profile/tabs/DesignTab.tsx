import clsx from "clsx";

const templates = [
  {
    name: "Classic",
    imageSrc: "/images/classic-template.png",
  },
  {
    name: "Portrait",
    imageSrc: "/images/portrait-template.png",
  },
  {
    name: "Banner",
    imageSrc: "/images/banner-template.png",
  },
];

const DesignTab = () => {
  const currentTemplate = "Portrait";

  return (
    <div className="p-1">
      <h2 className="text-base font-medium lg:text-xl">Templates</h2>
      <p className="text-xs text-primary-500 lg:text-sm">
        Choose a template to customize your profile design.
      </p>

      <div className="mt-5 flex gap-x-2 overflow-x-auto">
        {templates.map(({ name, imageSrc }) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div
              className={clsx(
                currentTemplate === name
                  ? "rounded-lg border-2 border-primary-900 p-1.5"
                  : "",
              )}
            >
              <img
                className="h-full w-full object-cover"
                src={imageSrc}
                alt={`${name} Template`}
              />
            </div>

            <p
              className={clsx(
                currentTemplate === name
                  ? "font-medium text-primary-900"
                  : "text-primary-500",
                "text-sm",
              )}
            >
              {name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignTab;
