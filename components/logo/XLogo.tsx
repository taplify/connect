function XLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="m20.9 3-.8-.7-6.5 7.4-5.1-7.2H3L10.6 13l-7.1 8 .7.7 7-7.9 5.6 7.7H22l-8-11L21 3h-.1ZM5 3.5l12.2 17h2.9L7.9 3.5H5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default XLogo;
