function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto h-[600px] w-[300px] scale-90 transform rounded-[2.5rem] border-[14px] border-primary-800 bg-primary-900 text-primary-50 lg:scale-100">
      <div className="absolute -start-[17px] top-[72px] h-[32px] w-[3px] rounded-s-lg bg-gray-800"></div>
      <div className="absolute -start-[17px] top-[124px] h-[46px] w-[3px] rounded-s-lg bg-gray-800"></div>
      <div className="absolute -start-[17px] top-[178px] h-[46px] w-[3px] rounded-s-lg bg-gray-800"></div>
      <div className="absolute -end-[17px] top-[142px] h-[64px] w-[3px] rounded-e-lg bg-gray-800"></div>
      <div className="h-[572px] w-[272px] overflow-y-auto rounded-[1.5rem]">
        {children}
      </div>
    </div>
  );
}

export default PhoneFrame;
