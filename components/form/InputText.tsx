import clsx from 'clsx';

interface InputTextProps {
  id: string;
  type?: React.HTMLInputTypeAttribute;
  label: string;
  style?: string;
  value: string;
  onChange: (value: string) => void;
}

function InputText({
  id,
  type = "text",
  label,
  style,
  value,
  onChange,
}: InputTextProps) {
  return (
    <div className={clsx("relative", style)}>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer block w-full appearance-none rounded-lg border-none bg-transparent px-3 pb-2.5 pt-4 text-base text-gray-900 outline-none ring-1 ring-primary-200 transition-all duration-200 focus:ring-2 focus:ring-primary-900"
        placeholder=" "
      />
      <label
        htmlFor={id}
        className="absolute start-2 top-2 z-10 origin-[0] -translate-y-[18px] scale-90 transform cursor-text bg-white px-1 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-[18px] peer-focus:scale-90 peer-focus:px-1 peer-focus:text-gray-700 lg:text-base rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
      >
        {label}
      </label>
    </div>
  );
}

export default InputText;
