const DataShowingWrapper = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col w-full">
      <div className="px-3 py-2 rounded-t-[9px] bg-text-4">
        <p className="text-text-2 font-kanit font-normal text-lg ">{title}</p>
      </div>
      <div className="p-4 lg:p-6 bg-customgray-100 rounded-b-[9px]">
        {children}
      </div>
    </div>
  );
};

export default DataShowingWrapper;
